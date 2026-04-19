/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 2.0 (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: KUNDALI DISPLAY — BEAUTIFUL PLANET STATUS IN HINDI
 */

'use client';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

type Planet = {
  name: string;
  rashi: string;
  house: number;
  strength: number;
  isRetrograde: boolean;
  nakshatra: string;
  degree: number;
};

type KundaliDisplayProps = {
  name: string;
  dob: string;
  city: string;
  lagna: string;
  lagnaLord: string;
  nakshatra: string;
  nakshatraLord: string;
  mahadasha: string;
  antardasha: string;
  dashaBalance: string;
  choghadiya: string;
  choghadiyaType: string;
  tithi: string;
  vara: string;
  yoga: string;
  rahuStart: string;
  rahuEnd: string;
  abhijeetStart: string;
  abhijeetEnd: string;
  planets: Planet[];
};

const PLANET_COLORS: Record<string, string> = {
  Sun:     '#FB923C',
  Moon:    '#C4B5FD',
  Mars:    '#F87171',
  Mercury: '#6EE7B7',
  Jupiter: '#FCD34D',
  Venus:   '#F9A8D4',
  Saturn:  '#94A3B8',
  Rahu:    '#A78BFA',
  Ketu:    '#FCA5A5',
};

const PLANET_NAMES_HI: Record<string, string> = {
  Sun:     'Surya ☀️',
  Moon:    'Chandra 🌙',
  Mars:    'Mangal ♂',
  Mercury: 'Budh ☿',
  Jupiter: 'Guru ♃',
  Venus:   'Shukra ♀',
  Saturn:  'Shani ♄',
  Rahu:    'Rahu ☊',
  Ketu:    'Ketu ☋',
};

function getPlanetStatus(strength: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (strength >= 80) return { label: 'Uchcha',   color: '#4ADE80', bg: 'rgba(34,197,94,0.12)' };
  if (strength >= 65) return { label: 'Balwaan',  color: GOLD,      bg: 'rgba(212,175,55,0.12)' };
  if (strength >= 45) return { label: 'Madhyam',  color: '#94A3B8', bg: 'rgba(148,163,184,0.10)' };
  return                      { label: 'Neech',   color: '#F87171', bg: 'rgba(239,68,68,0.12)' };
}

function StrengthBar({ strength }: { strength: number }) {
  const pct    = Math.round(strength);
  const status = getPlanetStatus(pct);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        flex: 1, height: 4,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: status.color, borderRadius: 2,
        }} />
      </div>
      <span style={{
        fontSize: 10, color: status.color,
        minWidth: 52, fontWeight: 600,
        textAlign: 'right',
      }}>
        {status.label}
      </span>
    </div>
  );
}

export default function KundaliDisplay({
  name, dob, city, lagna, lagnaLord, nakshatra, nakshatraLord,
  mahadasha, antardasha, dashaBalance,
  choghadiya, choghadiyaType, tithi, vara, yoga,
  rahuStart, rahuEnd, abhijeetStart, abhijeetEnd,
  planets,
}: KundaliDisplayProps) {

  const choghadiyaColor = choghadiyaType === 'Good'
    ? '#22C55E' : choghadiyaType === 'Bad' ? '#EF4444' : '#EAB308';

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640, margin: '0 auto', padding: '0 4px' }}>

      {/* ── HEADER CARD ── */}
      <div style={{
        background: 'rgba(6,12,28,0.95)',
        border: `1px solid ${GOLD_RGBA(0.3)}`,
        borderRadius: 16, padding: '20px 24px', marginBottom: 12,
        boxShadow: `0 0 40px ${GOLD_RGBA(0.06)}`,
      }}>
        {/* Name + DOB row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: GOLD_RGBA(0.15),
            border: `2px solid ${GOLD_RGBA(0.5)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: GOLD, flexShrink: 0,
          }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
              {name}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.7)' }}>
              {dob} · {city}
            </div>
            <div style={{ fontSize: 10, color: GOLD_RGBA(0.55), marginTop: 2 }}>
              Trikal Engine V15 · Lahiri Ayanamsha
            </div>
          </div>
        </div>

        {/* 3 Key Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
          {[
            { label: 'Lagna',     value: lagna,    sub: `Lord: ${lagnaLord}` },
            { label: 'Nakshatra', value: nakshatra, sub: `Lord: ${nakshatraLord}` },
            { label: 'Mahadasha', value: mahadasha, sub: antardasha },
          ].map(item => (
            <div key={item.label} style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 10, padding: '10px 12px',
              border: `1px solid ${GOLD_RGBA(0.12)}`,
            }}>
              <div style={{
                fontSize: 9, color: 'rgba(148,163,184,0.5)',
                marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {item.label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: GOLD, marginBottom: 1 }}>
                {item.value}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.55)' }}>
                {item.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Dasha Balance */}
        <div style={{
          padding: '8px 14px',
          background: GOLD_RGBA(0.07),
          borderRadius: 8,
          border: `1px solid ${GOLD_RGBA(0.18)}`,
        }}>
          <span style={{ fontSize: 12, color: GOLD_RGBA(0.8) }}>⏳ {dashaBalance}</span>
        </div>
      </div>

      {/* ── PLANETS TABLE ── */}
      <div style={{
        background: 'rgba(6,12,28,0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '16px 20px', marginBottom: 12,
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr 140px',
          gap: 8, marginBottom: 10,
          paddingBottom: 8,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Planet</span>
          <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rashi · House</span>
          <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Strength</span>
        </div>

        {planets.map((p, i) => {
          const color  = PLANET_COLORS[p.name] ?? '#94A3B8';
          const status = getPlanetStatus(p.strength);
          return (
            <div key={p.name} style={{
              display: 'grid',
              gridTemplateColumns: '120px 1fr 140px',
              gap: 8, alignItems: 'center',
              padding: '8px 0',
              borderBottom: i < planets.length - 1
                ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              {/* Planet name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: color, flexShrink: 0,
                  boxShadow: `0 0 6px ${color}60`,
                }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                    {PLANET_NAMES_HI[p.name] ?? p.name}
                    {p.isRetrograde && (
                      <span style={{
                        fontSize: 9, background: 'rgba(167,139,250,0.15)',
                        color: '#A78BFA', borderRadius: 3,
                        padding: '1px 4px', marginLeft: 5,
                      }}>℞</span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.4)' }}>
                    {p.degree.toFixed(1)}°
                  </div>
                </div>
              </div>

              {/* Rashi + House */}
              <div>
                <span style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>
                  {p.rashi}
                </span>
                <span style={{
                  fontSize: 10, color: 'rgba(148,163,184,0.45)',
                  marginLeft: 6,
                }}>
                  House {p.house}
                </span>
                <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.35)', marginTop: 1 }}>
                  {p.nakshatra}
                </div>
              </div>

              {/* Strength bar + label */}
              <div>
                <StrengthBar strength={p.strength} />
                {p.isRetrograde && (
                  <div style={{ fontSize: 9, color: '#A78BFA', marginTop: 2 }}>
                    Vakri — karmic revisit
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── PANCHANG CARD ── */}
      <div style={{
        background: 'rgba(6,12,28,0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '16px 20px', marginBottom: 12,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: GOLD_RGBA(0.6),
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14,
        }}>
          🗓 Aaj Ka Panchang
        </div>

        {[
          { label: 'Vara (Din)',       value: vara,                              warn: false },
          { label: 'Tithi',            value: tithi,                             warn: false },
          { label: 'Yoga',             value: yoga,                              warn: false },
          { label: 'Choghadiya',       value: choghadiya, badge: choghadiyaType, warn: false },
          { label: 'Abhijeet Muhurta', value: `${abhijeetStart} – ${abhijeetEnd}`, warn: false },
          { label: 'Rahu Kaal ⚠️',    value: `${rahuStart} – ${rahuEnd}`,       warn: true  },
        ].map(row => (
          <div key={row.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '7px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.55)' }}>
              {row.label}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: row.warn ? '#F87171' : '#fff',
              }}>
                {row.value}
              </span>
              {row.badge && (
                <span style={{
                  fontSize: 10, padding: '2px 7px', borderRadius: 4,
                  background: `${choghadiyaColor}18`,
                  color: choghadiyaColor,
                  border: `1px solid ${choghadiyaColor}30`,
                  fontWeight: 600,
                }}>
                  {row.badge}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Choghadiya advice */}
        <div style={{
          marginTop: 12, padding: '8px 12px',
          background: `${choghadiyaColor}0d`,
          borderRadius: 8,
          border: `1px solid ${choghadiyaColor}25`,
        }}>
          <span style={{ fontSize: 11, color: choghadiyaColor }}>
            {choghadiyaType === 'Good'
              ? '✅ Abhi ka samay shubh hai — koi bhi naya kaam shuru kar sakte hain'
              : choghadiyaType === 'Bad'
              ? '⚠️ Abhi ka samay saavdhani ka hai — bade faisale thodi der mein karein'
              : '⚡ Madhyam samay — routine kaam theek hain, bade faisale baad mein'}
          </span>
        </div>
      </div>

      {/* ── JINI CTA ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30,10,60,0.9) 0%, rgba(6,12,28,0.95) 100%)',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: 16, padding: '18px 22px',
      }}>
        <div style={{
          fontSize: 13, color: 'rgba(167,139,250,0.85)',
          marginBottom: 8, fontStyle: 'italic', lineHeight: 1.6,
        }}>
          "Rohiit Gupta ji ka Trikal framework kehta hai — aapki Kundali mein bahut kuch hai jo sirf aap ke liye likha hai. Kaal ka ek aur raaz abhi baki hai..."
        </div>
        <div style={{
          fontSize: 11, color: 'rgba(148,163,184,0.45)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#22C55E',
            boxShadow: '0 0 6px #22C55E',
            display: 'inline-block',
          }} />
          Jini online hai — apna sawaal neeche type karein 👇
        </div>
      </div>

    </div>
  );
}