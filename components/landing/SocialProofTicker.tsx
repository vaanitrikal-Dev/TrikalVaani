'use client';

import { useEffect, useRef } from 'react';

const ACTIVITIES = [
  'Rohit from Delhi just checked his Career Pivot Window',
  'Anjali from Noida found a Green Flag in her compatibility check',
  'Priya from Mumbai discovered her Manifestation Luck is at 91%',
  'Vikram from Pune checked his Property Yog — it opens in August',
  'Sneha from Bengaluru got clarity on her Toxic Boss situation',
  'Arjun from Hyderabad found his Wealth Window opens next month',
  'Kavya from Chennai checked her Ex-Back closure reading',
  'Ravi from Kolkata discovered his Retirement Peace timing',
  'Meera from Ahmedabad checked her Child\'s Destiny path',
  'Siddharth from Jaipur found his Dream Career Pivot window',
  'Pooja from Lucknow got her Karz Mukti timing confirmed',
  'Rahul from Chandigarh discovered a rare Dhana Yog in his chart',
  'Divya from Surat checked her partner compatibility — 82% match',
  'Amit from Nagpur found Green Flags in his relationship reading',
  'Sunita from Indore got her Spiritual Second Innings timing',
];

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export default function SocialProofTicker() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let pos = 0;
    let raf: number;
    const speed = 0.45;

    function animate() {
      pos -= speed;
      const half = track!.scrollWidth / 2;
      if (Math.abs(pos) >= half) pos = 0;
      track!.style.transform = `translateX(${pos}px)`;
      raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const items = [...ACTIVITIES, ...ACTIVITIES];

  return (
    <div
      className="relative overflow-hidden py-3"
      style={{
        background: 'rgba(6,10,24,0.85)',
        borderTop: `1px solid ${GOLD_RGBA(0.1)}`,
        borderBottom: `1px solid ${GOLD_RGBA(0.1)}`,
      }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, #030712 0%, transparent 100%)' }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, #030712 0%, transparent 100%)' }}
      />

      <div ref={trackRef} className="flex items-center gap-0 whitespace-nowrap will-change-transform">
        {items.map((text, i) => (
          <div key={i} className="flex items-center gap-2 px-5 flex-shrink-0">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse"
              style={{ background: i % 3 === 0 ? '#22C55E' : i % 3 === 1 ? '#F472B6' : GOLD }}
            />
            <span className="text-xs" style={{ color: 'rgba(148,163,184,0.75)' }}>
              {text}
            </span>
            <span className="text-slate-700 mx-2">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
