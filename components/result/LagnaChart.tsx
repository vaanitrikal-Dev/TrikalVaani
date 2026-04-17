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

const HOUSE_POSITIONS: Record<number, { label: string; cx: number; cy: number }> = {
  1:  { label: 'Lagna', cx: 300, cy: 160 },
  2:  { label: '2nd',   cx: 400, cy: 80  },
  3:  { label: '3rd',   cx: 500, cy: 160 },
  4:  { label: '4th',   cx: 420, cy: 240 },
  5:  { label: '5th',   cx: 500, cy: 320 },
  6:  { label: '6th',   cx: 400, cy: 400 },
  7:  { label: '7th',   cx: 300, cy: 320 },
  8:  { label: '8th',   cx: 200, cy: 400 },
  9:  { label: '9th',   cx: 100, cy: 320 },
  10: { label: '10th',  cx: 180, cy: 240 },
  11: { label: '11th',  cx: 100, cy: 160 },
  12: { label: '12th',  cx: 200, cy: 80  },
};

const PLANET_ABBR: Record<string, { abbr: string; color: string }> = {
  Sun:     { abbr: 'Su', color: '#FCD34D' },
  Moon:    { abbr: 'Mo', color: '#E2E8F0' },
  Mars:    { abbr: 'Ma', color: '#F87171' },
  Mercury: { abbr: 'Me', color: '#34D399' },
  Jupiter: { abbr: 'Ju', color: '#FACC15' },
  Venus:   { abbr: 'Ve', color: '#F472B6' },
  Saturn:  { abbr: 'Sa', color: '#94A3B8' },
  Rahu:    { abbr: 'Ra', color: '#A78BFA' },
  Ketu:    { abbr: 'Ke', color: '#FB923C' },
};

function getPlanetsForHouse(planets: PlanetPosition[], house: number): PlanetPosition[] {
  return planets.filter((p) => p.house === house);
}

function derivePlanetsFromDob(dob: string): PlanetPosition[] {
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

export default function LagnaChart({ ascendant, planets, name }: Props) {
  const size = 480;
  const cx = size / 2;
  const cy = size / 2;
  const half = size / 2;

  const goldLine = GOLD_RGBA(0.6);
  const dimLine = GOLD_RGBA(0.18);
  const bg = 'rgba(4,8,20,0.97)';

  const houseGroups: Record<number, PlanetPosition[]> = {};
  for (let h = 1; h <= 12; h++) {
    houseGroups[h] = getPlanetsForHouse(planets, h);
  }

  function renderHouseLabel(house: number, x: number, y: number) {
    return (
      <text
        key={`hl-${house}`}
        x={x}
        y={y}
        textAnchor="middle"
        fontSize="9"
        fill={GOLD_RGBA(0.3)}
        fontFamily="serif"
      >
        {house}
      </text>
    );
  }

  function renderPlanets(house: number, baseCx: number, baseCy: number) {
    const ps = houseGroups[house] ?? [];
    if (!ps.length) return null;
    const cols = ps.length <= 2 ? ps.length : 3;
    const spacing = 16;
    const startX = baseCx - ((cols - 1) * spacing) / 2;

    return ps.map((p, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const px = startX + col * spacing;
      const py = baseCy + row * 14 - (ps.length > 2 ? 7 : 0);
      const abbr = PLANET_ABBR[p.planet]?.abbr ?? p.planet.slice(0, 2);
      const color = PLANET_ABBR[p.planet]?.color ?? GOLD;
      return (
        <text
          key={`p-${house}-${p.planet}`}
          x={px}
          y={py}
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill={color}
          fontFamily="sans-serif"
        >
          {abbr}
        </text>
      );
    });
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(4,8,20,0.95)',
        border: `1px solid ${GOLD_RGBA(0.15)}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="px-5 pt-5 pb-2 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: GOLD_RGBA(0.5) }}>
            Lagna Chart (D1)
          </p>
          <h3 className="text-base font-bold text-white">
            {name.split(' ')[0]}&apos;s Janma Kundali
          </h3>
        </div>
        <div
          className="text-xs px-3 py-1.5 rounded-full font-semibold"
          style={{ background: GOLD_RGBA(0.1), border: `1px solid ${GOLD_RGBA(0.25)}`, color: GOLD }}
        >
          Lagna: {ascendant}
        </div>
      </div>

      <div className="px-3 pb-4 flex justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width="100%"
          style={{ maxWidth: '380px' }}
          aria-label="North Indian Lagna chart"
        >
          <rect width={size} height={size} fill={bg} rx="12" />

          <rect x="2" y="2" width={size - 4} height={size - 4} fill="none" stroke={goldLine} strokeWidth="1.2" rx="10" />
          <line x1="0" y1="0" x2={half} y2={half} stroke={goldLine} strokeWidth="1" />
          <line x1={size} y1="0" x2={half} y2={half} stroke={goldLine} strokeWidth="1" />
          <line x1="0" y1={size} x2={half} y2={half} stroke={goldLine} strokeWidth="1" />
          <line x1={size} y1={size} x2={half} y2={half} stroke={goldLine} strokeWidth="1" />

          <line x1={half} y1="0" x2={half} y2={size} stroke={dimLine} strokeWidth="0.8" />
          <line x1="0" y1={half} x2={size} y2={half} stroke={dimLine} strokeWidth="0.8" />

          <line x1="0" y1="0" x2={size} y2={size} stroke={dimLine} strokeWidth="0.7" />
          <line x1={size} y1="0" x2="0" y2={size} stroke={dimLine} strokeWidth="0.7" />

          <polygon points={`${cx},${cy - 95} ${cx + 95},${cy} ${cx},${cy + 95} ${cx - 95},${cy}`}
            fill="none" stroke={GOLD_RGBA(0.1)} strokeWidth="1" />

          <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill={GOLD_RGBA(0.45)} fontFamily="serif" fontWeight="bold">
            {ascendant}
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" fontSize="7.5" fill={GOLD_RGBA(0.25)} fontFamily="serif">
            Kundali
          </text>

          {renderHouseLabel(1,  cx,       35)}
          {renderHouseLabel(2,  cx + 118, 35)}
          {renderHouseLabel(3,  cx + 235, 35)}
          {renderHouseLabel(4,  cx + 235, cy - 30)}
          {renderHouseLabel(5,  cx + 235, cy + 30)}
          {renderHouseLabel(6,  cx + 235, size - 35)}
          {renderHouseLabel(7,  cx,       size - 25)}
          {renderHouseLabel(8,  cx - 118, size - 35)}
          {renderHouseLabel(9,  35,       size - 35)}
          {renderHouseLabel(10, 35,       cy + 30)}
          {renderHouseLabel(11, 35,       cy - 30)}
          {renderHouseLabel(12, cx - 118, 35)}

          {renderPlanets(1,  cx,       cy - 60)}
          {renderPlanets(2,  cx + 118, cy - 80)}
          {renderPlanets(3,  cx + 210, cy - 60)}
          {renderPlanets(4,  cx + 115, cy)}
          {renderPlanets(5,  cx + 210, cy + 60)}
          {renderPlanets(6,  cx + 118, cy + 80)}
          {renderPlanets(7,  cx,       cy + 60)}
          {renderPlanets(8,  cx - 118, cy + 80)}
          {renderPlanets(9,  cx - 210, cy + 60)}
          {renderPlanets(10, cx - 115, cy)}
          {renderPlanets(11, cx - 210, cy - 60)}
          {renderPlanets(12, cx - 118, cy - 80)}
        </svg>
      </div>

      <div className="px-5 pb-5">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {Object.entries(PLANET_ABBR).map(([name, { abbr, color }]) => (
            <div key={name} className="flex items-center gap-1">
              <span className="text-xs font-bold" style={{ color }}>{abbr}</span>
              <span className="text-xs text-slate-600">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { derivePlanetsFromDob };
