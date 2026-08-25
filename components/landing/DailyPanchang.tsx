'use client';

/**
 * ============================================================
 * TRIKAAL VAANI — DailyPanchang (homepage)
 * v2.0 (25 Aug 2026)
 *
 * WHAT WAS WRONG
 * The previous version invented every value it displayed:
 *
 *     const lunarDay     = (dayOfYear * 12) % 30;   // tithi
 *     const nakshatraIdx = (dayOfYear * 13) % 27;   // nakshatra
 *     const yogaIdx      = (dayOfYear * 7)  % 27;   // yoga
 *     const sunriseM     = 15 + (dayOfYear % 20);   // sunrise minutes
 *     const sunsetM      = 30 + (dayOfYear % 30);   // sunset minutes
 *
 * Arithmetic on the day number — no ephemeris, no astronomy, not even a
 * lunar month. On 25 Aug 2026 it showed "Krishna Paksha Dashami, Rohini,
 * sunrise 6:32" when the sky held Shukla Trayodashi, Uttara Ashadha,
 * sunrise 05:59. Roughly half a lunar month and seventeen nakshatras out.
 *
 * The footer signed that output with "Verified by Rohiit Gupta", which made
 * a fabricated panchang carry the Chief Vedic Architect's name on the most
 * visited page of the site.
 *
 * WHAT IT DOES NOW
 * Reads /api/panchang/today, which is backed by Swiss Ephemeris with Lahiri
 * ayanamsha and has been returning correct values all along — the homepage
 * simply never called it. Nothing is computed in the browser.
 *
 * If the API is unreachable the section renders NOTHING rather than falling
 * back to an approximation. A missing panchang is a visible gap; a plausible
 * wrong one is a claim, and this page carries a signature.
 * ============================================================
 */

import { useEffect, useState } from 'react';
import { Sun, Moon, Star, Clock } from 'lucide-react';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const TITHI_HI: Record<string, string> = {
  Pratipada: 'प्रतिपदा', Dwitiya: 'द्वितीया', Tritiya: 'तृतीया', Chaturthi: 'चतुर्थी',
  Panchami: 'पंचमी', Shashthi: 'षष्ठी', Saptami: 'सप्तमी', Ashtami: 'अष्टमी',
  Navami: 'नवमी', Dashami: 'दशमी', Ekadashi: 'एकादशी', Dwadashi: 'द्वादशी',
  Trayodashi: 'त्रयोदशी', Chaturdashi: 'चतुर्दशी', Purnima: 'पूर्णिमा', Amavasya: 'अमावस्या',
};

const VAARA_HI: Record<string, string> = {
  Ravivar: 'रविवार', Somvar: 'सोमवार', Mangalvar: 'मंगलवार', Budhvar: 'बुधवार',
  Guruvar: 'गुरुवार', Shukravar: 'शुक्रवार', Shanivar: 'शनिवार',
};

interface PanchangApi {
  date?: string;
  weekday?: string;
  tithi?: { name?: string; paksha?: string };
  nakshatra?: { name?: string; pada?: number };
  yoga?: { name?: string };
  karana?: { name?: string };
  sunrise?: string;
  sunset?: string;
  rahu_kaal?: string;
  location?: { city?: string };
  ayanamsha?: string;
  engine?: string;
}

/** "05:59" -> "5:59 AM". Returns null for anything unparseable rather than guessing. */
function to12h(hhmm?: string): string | null {
  if (!hhmm) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m[2]} ${suffix}`;
}

/**
 * Abhijit is the eighth of fifteen equal parts of the day — a real division
 * of sunrise-to-sunset, not the midpoint fudge the old version used.
 */
function abhijit(sunriseStr?: string, sunsetStr?: string): string | null {
  const parse = (s?: string) => {
    if (!s) return null;
    const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  };
  const sr = parse(sunriseStr);
  const ss = parse(sunsetStr);
  if (sr === null || ss === null || ss <= sr) return null;
  const part = (ss - sr) / 15;
  const start = sr + part * 7;
  const fmt = (mins: number) => {
    const h = Math.floor(mins / 60) % 24;
    const mm = String(Math.round(mins % 60)).padStart(2, '0');
    const suffix = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 === 0 ? 12 : h % 12}:${mm} ${suffix}`;
  };
  return `${fmt(start)} – ${fmt(start + part)}`;
}

export default function DailyPanchang() {
  const [p, setP] = useState<PanchangApi | null>(null);
  const [failed, setFailed] = useState(false);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    setDateStr(
      new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      }),
    );
    let alive = true;
    fetch('/api/panchang/today')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: PanchangApi) => { if (alive) setP(d); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, []);

  // No data, no section. Never an approximation — see the header note.
  if (failed || !p || !p.tithi?.name) return null;

  const tithiEn = `${p.tithi.paksha ?? ''} ${p.tithi.name}`.trim();
  const pakshaHi = /krishna/i.test(p.tithi.paksha ?? '') ? 'कृष्ण पक्ष' : 'शुक्ल पक्ष';
  const tithiHi = `${pakshaHi} ${TITHI_HI[p.tithi.name] ?? ''}`.trim();
  const sunrise = to12h(p.sunrise);
  const sunset = to12h(p.sunset);
  const abhi = abhijit(p.sunrise, p.sunset);

  // Every row is dropped when its value is missing, so a gap in the API can
  // never surface as a blank or a placeholder.
  const rows = [
    { icon: Moon,  label: 'Tithi', value: tithiEn, hi: tithiHi },
    p.nakshatra?.name && {
      icon: Star, label: 'Nakshatra',
      value: p.nakshatra.pada ? `${p.nakshatra.name} Pada ${p.nakshatra.pada}` : p.nakshatra.name,
      hi: '',
    },
    p.yoga?.name && { icon: Sun, label: 'Yoga', value: p.yoga.name, hi: '' },
    p.karana?.name && { icon: Star, label: 'Karana', value: p.karana.name, hi: '' },
    abhi && { icon: Clock, label: 'Abhijit Muhurat (अभिजीत मुहूर्त)', value: abhi, hi: 'शुभ समय' },
    sunrise && sunset && { icon: Sun, label: 'Sunrise / Sunset', value: `${sunrise} / ${sunset}`, hi: '' },
    p.rahu_kaal && { icon: Clock, label: 'Rahu Kaal (राहु काल)', value: p.rahu_kaal, hi: 'त्याज्य समय' },
    p.weekday && {
      icon: Star, label: 'Vaara',
      value: `${p.weekday}${VAARA_HI[p.weekday] ? ` (${VAARA_HI[p.weekday]})` : ''}`,
      hi: '',
    },
  ].filter(Boolean) as { icon: typeof Sun; label: string; value: string; hi: string }[];

  const city = p.location?.city ?? 'Delhi NCR';
  const engine = p.engine ?? 'Swiss Ephemeris';
  const ayanamsha = p.ayanamsha ?? 'Lahiri';

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
              <div key={i} className="px-5 py-4" style={{ background: 'rgba(8,11,18,0.9)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD_RGBA(0.55) }} />
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
                <p className="text-sm font-semibold text-white">{value}</p>
                {hi && <p className="text-xs mt-0.5" style={{ color: GOLD_RGBA(0.5) }}>{hi}</p>}
              </div>
            ))}
          </div>

          {/* v2.0: the claim now names what actually produced the numbers. The old
              footer read "Verified by Rohiit Gupta" over values invented from the
              day of the year — a signature on something never computed. */}
          <div className="px-5 py-3" style={{ background: GOLD_RGBA(0.03), borderTop: `1px solid ${GOLD_RGBA(0.1)}` }}>
            <p className="text-xs text-slate-600 text-center">
              {engine} · {ayanamsha} Ayanamsha · {city} (IST) · Rohiit Gupta, Chief Vedic Architect
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
