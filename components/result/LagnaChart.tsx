'use client';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export type PlanetPosition = {
  planet: string;
  house: number;
  symbol: string;
  color: string;
};

type Props = {
  ascendant: string;
  planets: PlanetPosition[];
  name: string;
};

const PLANET_META: Record<string, { abbr: string; color: string }> = {
  Sun:     { abbr: 'Su', color: '#FCD34D' },
  Moon:    { abbr: 'Mo', color: '#E2E8F0' },
  Mars:    { abbr: 'Ma', color: '#F87171' },
  Mercury: { abbr: 'Me', color: '#34D399' },
  Jupiter: { abbr: 'Ju', color: '#FACC15' },
  Venus:   { abbr: 'Ve', color: '#F472B6' },
  Saturn:  { abbr: 'Sa', color: '#94A3B8' },
  Rahu:    { abbr: 'Ra', color: '#C4B5FD' },
  Ketu:    { abbr: 'Ke', color: '#FB923C' },
};

export function derivePlanetsFromDob(dob: string): PlanetPosition[] {
  if (!dob) return [];
  const seed = dob.replace(/-/g, '').split('').reduce((a, c) => a + parseInt(c, 10), 0);
  const names = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  return names.map((name, i) => ({
    planet: name,
    house: ((seed + i * 3) % 12) + 1,
    symbol: PLANET_META[name]?.abbr ?? name.slice(0, 2),
    color: PLANET_META[name]?.color ?? GOLD,
  }));
}

const S  = 480;
const H  = S / 2;
const Q  = S / 4;
const Q3 = (3 * S) / 4;

type Cell = {
  pts: string;
  nx: number; ny: number;
  cx: number; cy: number;
};

function pt(x: number, y: number) { return `${x},${y}`; }

const CELLS: Cell[] = [
  { pts: [pt(0,0), pt(S,0), pt(Q3,Q), pt(H,Q), pt(Q,Q)].join(' '),
    nx: H, ny: Q*0.35, cx: H, cy: Q*0.68 },
  { pts: [pt(S,0), pt(S,H), pt(Q3,Q)].join(' '),
    nx: Q3+38, ny: Q*0.55, cx: Q3+28, cy: Q*0.75 },
  { pts: [pt(S,H), pt(Q3,H), pt(Q3,Q)].join(' '),
    nx: Q3+34, ny: H-32, cx: Q3+24, cy: H-14 },
  { pts: [pt(S,H), pt(S,S), pt(Q3,Q3), pt(Q3,H)].join(' '),
    nx: Q3+34, ny: H+32, cx: Q3+24, cy: H+18 },
  { pts: [pt(S,S), pt(H,S), pt(Q3,Q3)].join(' '),
    nx: Q3+38, ny: Q3+32, cx: Q3+26, cy: Q3+18 },
  { pts: [pt(0,S), pt(S,S), pt(Q3,Q3), pt(H,Q3), pt(Q,Q3)].join(' '),
    nx: H, ny: S-Q*0.35, cx: H, cy: S-Q*0.68 },
  { pts: [pt(0,S), pt(Q,Q3), pt(0,H)].join(' '),
    nx: Q*0.28, ny: Q3+32, cx: Q*0.38, cy: Q3+18 },
  { pts: [pt(0,H), pt(Q,Q3), pt(Q,H)].join(' '),
    nx: Q*0.28, ny: H+30, cx: Q*0.38, cy: H+14 },
  { pts: [pt(0,H), pt(Q,H), pt(Q,Q), pt(0,0)].join(' '),
    nx: Q*0.28, ny: H-30, cx: Q*0.38, cy: H-14 },
  { pts: [pt(0,0), pt(Q,Q), pt(0,H)].join(' '),
    nx: Q*0.28, ny: Q*0.55, cx: Q*0.38, cy: Q*0.75 },
  { pts: [pt(0,0), pt(Q,Q), pt(H,Q)].join(' '),
    nx: Q*0.65, ny: Q*0.35, cx: Q*0.75, cy: Q*0.65 },
  { pts: [pt(S,0), pt(Q3,Q), pt(H,Q)].join(' '),
    nx: S-Q*0.65, ny: Q*0.35, cx: S-Q*0.75, cy: Q*0.65 },
];

const HOUSE_LABELS = ['1','2','3','4','5','6','7','8','9','10','11','12'];

function HousePlanets({ house, planets }: { house: number; planets: PlanetPosition[] }) {
  const ps = planets.filter(p => p.house === house);
  if (!ps.length) return null;

  const cell = CELLS[house - 1];
  const n = ps.length;
  const cols = Math.min(n, 3);
  const rows = Math.ceil(n / cols);
  const colGap = 16;
  const rowGap = 14;

  return (
    <>
      {ps.map((planet, i) => {
        const col  = i % cols;
        const row  = Math.floor(i / cols);
        const totalW = (Math.min(n, cols) - 1) * colGap;
        const totalH = (rows - 1) * rowGap;
        const px = cell.cx - totalW / 2 + col * colGap;
        const py = cell.cy - totalH / 2 + row * rowGap;
        const meta  = PLANET_META[planet.planet];
        const abbr  = meta?.abbr  ?? planet.planet.slice(0, 2);
        const color = meta?.color ?? GOLD;
        return (
          <text
            key={`${house}-${planet.planet}`}
            x={px} y={py}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fontWeight="800"
            fill={color}
            fontFamily="'Inter', system-ui, sans-serif"
            filter="url(#planetGlow)"
          >
            {abbr}
          </text>
        );
      })}
    </>
  );
}

export default function LagnaChart({ ascendant, planets, name }: Props) {
  const BORDER  = GOLD_RGBA(0.80);
  const GRID    = GOLD_RGBA(0.60);
  const DIAMOND = GOLD_RGBA(0.45);
  const H1_FILL = GOLD_RGBA(0.06);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(8,12,22,0.88)',
        border: `1px solid ${GOLD_RGBA(0.22)}`,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 ${GOLD_RGBA(0.08)}`,
      }}
    >
      <div className="px-5 pt-5 pb-2 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: GOLD_RGBA(0.5) }}>
            Lagna Chart (D1) — North Indian
          </p>
          <h3 className="text-base font-bold text-white">
            {name.split(' ')[0]}&apos;s Janma Kundali
          </h3>
        </div>
        <div
          className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full font-bold"
          style={{ background: GOLD_RGBA(0.12), border: `1px solid ${GOLD_RGBA(0.3)}`, color: GOLD }}
        >
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: GOLD }} />
          Lagna: {ascendant}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div
          className="aspect-square w-full max-w-[420px] mx-auto rounded-xl overflow-hidden"
          style={{
            background: 'rgba(5,8,16,0.97)',
            border: `1.5px solid ${GOLD_RGBA(0.25)}`,
            boxShadow: `inset 0 0 48px rgba(212,175,55,0.03)`,
          }}
        >
          <svg
            viewBox={`0 0 ${S} ${S}`}
            width="100%"
            height="100%"
            aria-label="North Indian Lagna Kundali chart — AstroSage standard"
            style={{ display: 'block', shapeRendering: 'crispEdges' }}
          >
            <defs>
              <filter id="planetGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="centerAura" cx="50%" cy="50%" r="30%">
                <stop offset="0%" stopColor={GOLD_RGBA(0.06)} />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            <rect width={S} height={S} fill="rgba(5,8,16,1)" />
            <rect width={S} height={S} fill="url(#centerAura)" />

            {CELLS.map((cell, i) => (
              <polygon key={`fill-${i}`} points={cell.pts}
                fill={i === 0 ? H1_FILL : 'transparent'} stroke="none" />
            ))}

            {/* Outer border */}
            <rect x="1.5" y="1.5" width={S-3} height={S-3}
              fill="none" stroke={BORDER} strokeWidth="2" strokeLinejoin="miter" />

            {/* Diagonals */}
            <line x1="0" y1="0" x2={S} y2={S} stroke={GRID} strokeWidth="1.2" />
            <line x1={S} y1="0" x2="0" y2={S} stroke={GRID} strokeWidth="1.2" />

            {/* Midlines */}
            <line x1={H} y1="0" x2={H} y2={S} stroke={GRID} strokeWidth="1.2" />
            <line x1="0" y1={H} x2={S} y2={H} stroke={GRID} strokeWidth="1.2" />

            {/* Outer diamond TC–MR–BC–ML */}
            <polygon points={`${H},0 ${S},${H} ${H},${S} 0,${H}`}
              fill="none" stroke={DIAMOND} strokeWidth="1.4" strokeLinejoin="miter" />

            {/* Inner diamond DT–DR–DB–DL */}
            <polygon points={`${H},${Q} ${Q3},${H} ${H},${Q3} ${Q},${H}`}
              fill={GOLD_RGBA(0.04)} stroke={GOLD_RGBA(0.38)}
              strokeWidth="1.1" strokeLinejoin="miter" />

            {/* Quarter-point dots */}
            {[[Q,Q],[Q3,Q],[Q,Q3],[Q3,Q3]].map(([dx,dy],i) => (
              <circle key={`qdot-${i}`} cx={dx} cy={dy} r="2.2" fill={GOLD_RGBA(0.4)} />
            ))}

            {/* House numbers */}
            {CELLS.map((cell, i) => (
              <text key={`num-${i}`} x={cell.nx} y={cell.ny}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="9.5" fill="rgba(148,163,184,0.42)"
                fontFamily="'Inter', system-ui, sans-serif" fontWeight="500">
                {HOUSE_LABELS[i]}
              </text>
            ))}

            {/* Center ascendant label */}
            <text x={H} y={H-11} textAnchor="middle" dominantBaseline="middle"
              fontSize="12.5" fill={GOLD_RGBA(0.68)}
              fontFamily="Georgia, 'Times New Roman', serif"
              fontWeight="bold" filter="url(#goldGlow)">
              {ascendant}
            </text>
            <text x={H} y={H+9} textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fill={GOLD_RGBA(0.22)}
              fontFamily="'Inter', system-ui, sans-serif" letterSpacing="2">
              KUNDALI
            </text>

            {/* Planet labels */}
            {Array.from({ length: 12 }, (_, i) => (
              <HousePlanets key={i} house={i + 1} planets={planets} />
            ))}

            {/* Corner dots */}
            {[[0,0],[S,0],[S,S],[0,S]].map(([cx,cy],i) => (
              <circle key={`corner-${i}`} cx={cx} cy={cy} r="3" fill={GOLD_RGBA(0.55)} />
            ))}

            {/* H1 apex marker */}
            <circle cx={H} cy={0} r="3" fill={GOLD_RGBA(0.75)} />
            <text x={H} y={16} textAnchor="middle" dominantBaseline="middle"
              fontSize="7.5" fill={GOLD_RGBA(0.55)}
              fontFamily="'Inter', system-ui, sans-serif"
              fontWeight="700" letterSpacing="1.2">
              ASC
            </text>
          </svg>
        </div>
      </div>

      {/* Planet Legend + Vedic credit */}
      <div className="px-5 pb-5 pt-2" style={{ borderTop: `1px solid ${GOLD_RGBA(0.08)}` }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: GOLD_RGBA(0.3) }}>
          Planet Legend
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-x-4 gap-y-2.5">
          {Object.entries(PLANET_META).map(([pName, { abbr, color }]) => (
            <div key={pName} className="flex items-center gap-1.5">
              <span className="text-xs font-black leading-none" style={{ color }}>{abbr}</span>
              <span className="text-xs leading-none" style={{ color: 'rgba(100,116,139,0.7)' }}>{pName}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-center" style={{ color: GOLD_RGBA(0.35) }}>
          Vedic insight verified by{' '}
          <span className="font-semibold" style={{ color: GOLD_RGBA(0.65) }}>Rohiit Gupta</span>
          , Chief Vedic Architect.
        </p>
      </div>
    </div>
  );
}
