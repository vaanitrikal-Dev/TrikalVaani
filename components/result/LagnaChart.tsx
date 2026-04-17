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

const PLANET_ABBR: Record<string, { abbr: string; color: string }> = {
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
  const planetNames = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  return planetNames.map((name, i) => ({
    planet: name,
    house: ((seed + i * 3) % 12) + 1,
    symbol: PLANET_ABBR[name]?.abbr ?? name.slice(0, 2),
    color: PLANET_ABBR[name]?.color ?? GOLD,
  }));
}

const S = 480;
const H = S / 2;
const Q = S / 4;

/*
  North Indian chart — 12 house cells defined as SVG polygon points.
  House 1 = top diamond (Lagna). Houses run clockwise.

  The square S×S is divided by:
    • 4 corner-to-center diagonals
    • vertical + horizontal midlines
  This creates 12 triangular/trapezoidal cells:

  H1  = top  diamond  (0,H)   (H,0)   (S,H)  clipped to top-center triangle
  Actually in North Indian style the 12 cells are laid out as:

  12 | 1 | 2
  ---|---|---
  11 |   | 3
  ---|---|---
  10 | 9 | 8   ... wait, standard North Indian is:

  2  | 1 | 12
  3  |   | 11
  4  | 5 | 6  ... still varies by tradition.

  The most common published layout:
    Top row    : 12, 1, 2
    Middle row : 11, (center), 3
    Bottom row : 10, 9, 8  ... and 4,5,6,7 on right side

  Actually the universally accepted North Indian grid is:

      ┌────┬────┬────┐
      │ 12 │  1 │  2 │
      ├────┤    ├────┤
      │ 11 │    │  3 │
      ├────┤    ├────┤
      │ 10 │  9 │  4 │  ← wait that's wrong too
      └────┴────┴────┘

  Correct standard:
    12  1  2
    11     3
    10  9  4  ← NO

  The real North Indian layout (viewed with 1 at top):
    Corners and edges of a diamond-within-square arrangement.
    Cell positions (row,col) starting from top:

    (0,0)=12  (0,1)=1   (0,2)=2
    (1,0)=11  center    (1,2)=3
    (2,0)=10  (2,1)=9   (2,2)=4

  And houses 5,6,7,8 fill the 4 corner triangles of the inner diamond...
  That gives only 9 cells. The actual correct layout uses ALL triangles:

  The proper North Indian diamond chart divides the square into 12 triangles:
    4 corner triangles + 4 side triangles + 4 diagonal inner triangles = 12

  Standard mapping (Parashara tradition, top=1/Lagna):
    H1  = top triangle      centroid ≈ (H, Q)
    H2  = top-right corner  centroid ≈ (3Q, Q)
    H3  = right side top    centroid ≈ (3Q+Q/2, H-Q/2)  ...

  Simplest correct approach — use the grid of triangles:
*/

type HouseCell = {
  points: string;
  numX: number;
  numY: number;
  planetX: number;
  planetY: number;
};

function pt(x: number, y: number) { return `${x},${y}`; }

const TL = pt(0, 0);
const TR = pt(S, 0);
const BL = pt(0, S);
const BR = pt(S, S);
const TOP = pt(H, 0);
const BOT = pt(H, S);
const MID_L = pt(0, H);
const MID_R = pt(S, H);
const CEN = pt(H, H);
const Q1 = pt(Q, Q);       // top-left quadrant center
const Q2 = pt(3*Q, Q);     // top-right quadrant center
const Q3 = pt(3*Q, 3*Q);   // bottom-right quadrant center
const Q4 = pt(Q, 3*Q);     // bottom-left quadrant center

const CELLS: HouseCell[] = [
  { points: [TOP, TR, Q2, CEN, Q1, TL].join(' '),       numX: H,      numY: Q*0.55, planetX: H,     planetY: Q*0.92 },
  { points: [TR, Q2, CEN].join(' '),                     numX: 3*Q+26, numY: Q*0.45, planetX: 3*Q+18,planetY: Q*0.7 },
  { points: [TR, MID_R, Q3, CEN, Q2].join(' '),         numX: 3*Q+Q*0.6, numY: H*0.6, planetX: 3*Q+Q*0.55, planetY: H*0.75 },
  { points: [MID_R, Q3, CEN].join(' '),                  numX: 3*Q+26, numY: 3*Q-12,  planetX: 3*Q+18,planetY: 3*Q+4 },
  { points: [MID_R, BR, Q3, CEN].join(' '),              numX: 3*Q+Q*0.6, numY: H+H*0.38, planetX: 3*Q+Q*0.55, planetY: H+H*0.52 },
  { points: [BR, Q3, CEN, Q4, BOT].join(' '),           numX: H,      numY: S-Q*0.55+12, planetX: H, planetY: S-Q*0.25 },
  { points: [BOT, Q4, CEN].join(' '),                    numX: Q-18,   numY: 3*Q+30, planetX: Q-10, planetY: 3*Q+46 },
  { points: [BL, BOT, Q4, CEN, Q1, MID_L].join(' '),   numX: Q*0.35, numY: H+H*0.4, planetX: Q*0.4, planetY: H+H*0.54 },
  { points: [BL, MID_L, Q1, CEN].join(' '),             numX: Q*0.35-8, numY: 3*Q-8,  planetX: Q*0.4-6, planetY: 3*Q+8 },
  { points: [TL, MID_L, Q1, CEN, Q4, BL].join(' '),    numX: Q*0.35, numY: H*0.6, planetX: Q*0.4, planetY: H*0.75 },
  { points: [TL, Q1, CEN].join(' '),                     numX: Q-18,   numY: Q*0.45, planetX: Q-10, planetY: Q*0.7 },
  { points: [TL, TOP, CEN, Q1].join(' '),                numX: Q*0.35, numY: Q*0.35, planetX: Q*0.55, planetY: Q*0.65 },
];

const HOUSE_LABELS = ['1','2','3','4','5','6','7','8','9','10','11','12'];

function PlanetsInHouse({ house, planets }: { house: number; planets: PlanetPosition[] }) {
  const ps = planets.filter(p => p.house === house);
  if (!ps.length) return null;

  const cell = CELLS[house - 1];
  const spacing = 14;
  const cols = ps.length <= 2 ? ps.length : 3;
  const rows = Math.ceil(ps.length / cols);
  const startX = cell.planetX - ((cols - 1) * spacing) / 2;
  const startY = cell.planetY - ((rows - 1) * 13) / 2;

  return (
    <>
      {ps.map((p, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const abbr = PLANET_ABBR[p.planet]?.abbr ?? p.planet.slice(0, 2);
        const color = PLANET_ABBR[p.planet]?.color ?? GOLD;
        return (
          <text
            key={`${house}-${p.planet}`}
            x={startX + col * spacing}
            y={startY + row * 13}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fontWeight="700"
            fill={color}
            fontFamily="Inter, system-ui, sans-serif"
            style={{ textShadow: `0 0 6px ${color}80` }}
          >
            {abbr}
          </text>
        );
      })}
    </>
  );
}

export default function LagnaChart({ ascendant, planets, name }: Props) {
  const goldLine = GOLD_RGBA(0.65);

  return (
    <div
      className="rounded-2xl overflow-hidden card-glass-strong"
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
        <div className="aspect-square w-full max-w-[400px] mx-auto">
          <svg
            viewBox={`0 0 ${S} ${S}`}
            width="100%"
            height="100%"
            aria-label="North Indian Lagna chart"
            style={{ display: 'block' }}
          >
            <defs>
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <rect width={S} height={S} fill="rgba(8,12,22,0.98)" rx="0" />

            {CELLS.map((cell, i) => (
              <polygon
                key={`cell-${i}`}
                points={cell.points}
                fill="transparent"
                stroke={goldLine}
                strokeWidth="1"
                strokeLinejoin="round"
              />
            ))}

            <line x1={H} y1={0} x2={H} y2={S} stroke={goldLine} strokeWidth="1" />
            <line x1={0} y1={H} x2={S} y2={H} stroke={goldLine} strokeWidth="1" />
            <line x1={0} y1={0} x2={S} y2={S} stroke={goldLine} strokeWidth="1" />
            <line x1={S} y1={0} x2={0} y2={S} stroke={goldLine} strokeWidth="1" />
            <rect x={1} y={1} width={S-2} height={S-2} fill="none" stroke={goldLine} strokeWidth="1.5" />

            <polygon
              points={`${H},${Q} ${3*Q},${H} ${H},${3*Q} ${Q},${H}`}
              fill={GOLD_RGBA(0.04)}
              stroke={GOLD_RGBA(0.12)}
              strokeWidth="0.8"
            />

            {CELLS.map((cell, i) => (
              <text
                key={`num-${i}`}
                x={cell.numX}
                y={cell.numY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fill="rgba(148,163,184,0.45)"
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight="500"
              >
                {HOUSE_LABELS[i]}
              </text>
            ))}

            <text
              x={H}
              y={H - 10}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fill={GOLD_RGBA(0.55)}
              fontFamily="Georgia, serif"
              fontWeight="bold"
            >
              {ascendant}
            </text>
            <text
              x={H}
              y={H + 8}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fill={GOLD_RGBA(0.25)}
              fontFamily="Inter, system-ui, sans-serif"
            >
              Kundali
            </text>

            {Array.from({ length: 12 }, (_, i) => (
              <PlanetsInHouse key={i} house={i + 1} planets={planets} />
            ))}
          </svg>
        </div>
      </div>

      <div className="px-5 pb-5 pt-1" style={{ borderTop: `1px solid ${GOLD_RGBA(0.07)}` }}>
        <p className="text-xs font-semibold tracking-widest uppercase mb-2.5" style={{ color: GOLD_RGBA(0.3) }}>Planet Legend</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {Object.entries(PLANET_ABBR).map(([pName, { abbr, color }]) => (
            <div key={pName} className="flex items-center gap-1.5">
              <span className="text-xs font-bold leading-none" style={{ color }}>{abbr}</span>
              <span className="text-xs leading-none" style={{ color: 'rgba(100,116,139,0.7)' }}>{pName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
