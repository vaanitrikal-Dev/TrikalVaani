/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 1.0 (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: KUNDALI DISPLAY — SHOWS AFTER BIRTH FORM SUBMIT
 * WARNING: DO NOT CHANGE — THIS IS THE CORE USER-FACING RESULT
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

function StrengthBar({ strength, color }: { strength: number; color: string }) {
  const pct = Math.round(strength);
  const bg  = pct >= 70 ? '#22C55E' : pct >= 45 ? '#EAB308' : '#EF4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        flex: 1, height: 4, background: 'rgba(255,255,255,0.08)',
        borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{ width: `${pct}%`, height: '100%', background: bg, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, color: 'rgba(148,163,184,0.8)', minWidth: 24 }}>{pct}</span>
    </div>
  );
}

export default function KundaliDisplay({
  name, dob, city, lagna, lagnaLord, nakshatra, nakshatraLord,
  mahadasha, antardasha, dashaBalance, choghadiya, choghadiyaType,
  tithi, vara, yoga, rahuStart, rahuEnd, abhijeetStart, abhijeetEnd,
  planets,
}: KundaliDisplayProps) {

  const choghadiyaColor = choghadiyaType === 'Good'
    ? '#22C55E' : choghadiyaType === 'Bad' ? '#EF4444' : '#EAB308';

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto', padding: '0 16px' }}>

      {/* Header Card */}
      <div style={{
        background: 'rgba(6,12,28,0.9)',
        border: `1px solid ${GOLD_RGBA(0.25)}`,
        borderRadius: 16, padding: '20px 24px', marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: GOLD_RGBA(0.15),
            border: `1px solid ${GOLD_RGBA(0.4)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, color: GOLD,
          }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{name}</div>
            <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.7)' }}>
              {dob} · {city}
            </div>
            <div style={{ fontSize: 10, color: GOLD_RGBA(0.6), marginTop: 2 }}>
              Trikal Engine V15 · Lahiri Ayanamsha
            </div>
          </div>
        </div>

        {/* 3 Key Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Lagna',     value: lagna,     sub: `Lord: ${lagnaLord}` },
            { label: 'Nakshatra', value: nakshatra,  sub: `Lord: ${nakshatraLord}` },
            { label: 'Mahadasha', value: mahadasha,  sub: antardasha },
          ].map(item => (
            <div key={item.label} style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 10, padding: '10px 12px',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.6)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {item.label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: GOLD, marginBottom: 1 }}>{item.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)' }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Dasha Balance */}
        <div style={{
          marginTop: 10, padding: '8px 12px',
          background: GOLD_RGBA(0.06),
          borderRadius: 8, border: `1px solid ${GOLD_RGBA(0.15)}`,
        }}>
          <span style={{ fontSize: 11, color: GOLD_RGBA(0.7) }}>⏳ {dashaBalance}</span>
        </div>
      </div>

      {/* Planets Table */}
      <div style={{
        background: 'rgba(6,12,28,0.9)',
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 16, padding: '16px 20px', marginBottom: 12,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: 'rgba(148,163,184,0.5)',
          textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12,
        }}>
          Planetary Positions
        </div>

        {planets.map((p, i) => {
          const color = PLANET_COLORS[p.name] ?? '#94A3B8';
          return (
            <div key={p.name} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 0',
              borderBottom: i < planets.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              {/* Planet dot */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: color, flexShrink: 0,
              }} />
              {/* Name */}
              <div style={{ width: 64, fontSize: 13, fontWeight: 500, color: '#fff' }}>
                {p.name}
                {p.isRetrograde && (
                  <span style={{
                    fontSize: 9, background: 'rgba(239,68,68,0.15)',
                    color: '#F87171', borderRadius: 3, padding: '1px 4px', marginLeft: 4,
                  }}>
                    ℞
                  </span>
                )}
              </div>
              {/* Rashi */}
              <div style={{ flex: 1, fontSize: 12, color: 'rgba(148,163,184,0.7)' }}>
                {p.rashi}
                <span style={{ fontSize: 10, color: 'rgba(148,163,184,0.4)', marginLeft: 4 }}>
                  H{p.house}
                </span>
              </div>
              {/* Strength bar */}
              <div style={{ width: 100 }}>
                <StrengthBar strength={p.strength} color={color} />
              </div>
              {/* Exalted/Own badge */}
              {p.strength >= 75 && (
                <span style={{
                  fontSize: 9, padding: '1px 5px', borderRadius: 3,
                  background: 'rgba(34,197,94,0.12)', color: '#4ADE80',
                }}>
                  {p.strength >= 80 ? 'Exalted' : 'Strong'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Panchang Card */}
      <div style={{
        background: 'rgba(6,12,28,0.9)',
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 16, padding: '16px 20px', marginBottom: 12,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: 'rgba(148,163,184,0.5)',
          textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12,
        }}>
          Aaj Ka Panchang
        </div>

        {[
          { label: 'Vara (Day)',         value: vara },
          { label: 'Tithi',              value: tithi },
          { label: 'Yoga',               value: yoga },
          {
            label: 'Choghadiya',
            value: choghadiya,
            badge: choghadiyaType,
            badgeColor: choghadiyaColor,
          },
          { label: 'Abhijeet Muhurta',   value: `${abhijeetStart} – ${abhijeetEnd}` },
          { label: 'Rahu Kaal (avoid)',  value: `${rahuStart} – ${rahuEnd}`, warn: true },
        ].map(row => (
          <div key={row.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '6px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.6)' }}>{row.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: 13, fontWeight: 500,
                color: row.warn ? '#F87171' : '#fff',
              }}>
                {row.value}
              </span>
              {row.badge && (
                <span style={{
                  fontSize: 10, padding: '1px 6px', borderRadius: 4,
                  background: `${row.badgeColor}18`, color: row.badgeColor,
                  border: `1px solid ${row.badgeColor}30`,
                }}>
                  {row.badge}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Jini CTA */}
      <div style={{
        background: 'rgba(30,10,60,0.8)',
        border: '1px solid rgba(139,92,246,0.3)',
        borderRadius: 16, padding: '16px 20px',
      }}>
        <div style={{ fontSize: 12, color: 'rgba(167,139,250,0.8)', marginBottom: 8, fontStyle: 'italic' }}>
          "Rohiit Gupta ji ka Trikal framework kehta hai — aapki Kundali mein bahut kuch hai jo sirf aap ke liye likha hai..."
        </div>
        <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>
          Jini se poochiye — apna sawaal type karein neeche 👇
        </div>
      </div>

    </div>
  );
}