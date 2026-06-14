// app/api/og/route.tsx
// Place at: app/api/og/route.tsx

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  doshas:        { label: 'Doshas',        color: '#DC2626', icon: '🔴' },
  mahadasha:     { label: 'Mahadasha',     color: '#7C3AED', icon: '🪐' },
  compatibility: { label: 'Compatibility', color: '#D97706', icon: '💫' },
  planets:       { label: 'Planets',       color: '#2563EB', icon: '🌙' },
  remedies:      { label: 'Remedies',      color: '#059669', icon: '🌿' },
  default:       { label: 'Vedic Jyotish', color: '#B45309', icon: '✨' },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title    = searchParams.get('title')    || 'Vedic Astrology Insights';
  const category = searchParams.get('category') || 'default';
  const cat      = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG['default'];

  // Truncate title if too long for the card
  const displayTitle = title.length > 80 ? title.slice(0, 77) + '...' : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #04021A 0%, #120840 50%, #04021A 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Star field dots */}
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: i % 5 === 0 ? '3px' : '1.5px',
              height: i % 5 === 0 ? '3px' : '1.5px',
              background: '#ffffff',
              borderRadius: '50%',
              opacity: 0.3 + (i % 5) * 0.1,
              top:  `${(i * 73 + 11) % 100}%`,
              left: `${(i * 47 + 7)  % 100}%`,
            }}
          />
        ))}

        {/* Gold top border */}
        <div style={{ width: '100%', height: '4px', background: 'linear-gradient(90deg, #F59E0B, #FCD34D, #F59E0B)', display: 'flex' }} />

        {/* Header row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '28px 56px 0',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, #F59E0B, #B45309)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px',
            }}>ॐ</div>
            <span style={{ color: '#FCD34D', fontSize: '22px', fontWeight: 700, letterSpacing: '1px' }}>
              Trikaal Vaani
            </span>
          </div>

          {/* Category badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: cat.color + '22',
            border: `1px solid ${cat.color}88`,
            borderRadius: '20px',
            padding: '8px 18px',
          }}>
            <span style={{ fontSize: '16px' }}>{cat.icon}</span>
            <span style={{ color: cat.color, fontSize: '15px', fontWeight: 600 }}>{cat.label}</span>
          </div>
        </div>

        {/* Main title */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          padding: '20px 56px',
        }}>
          <div style={{
            color: '#FFFFFF',
            fontSize: displayTitle.length > 50 ? '44px' : '52px',
            fontWeight: 800,
            lineHeight: 1.25,
            letterSpacing: '-0.5px',
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
            maxWidth: '1000px',
          }}>
            {displayTitle}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 56px 32px',
          borderTop: '1px solid #ffffff18',
          paddingTop: '20px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#94A3B8', fontSize: '15px' }}>By</span>
            <span style={{ color: '#FCD34D', fontSize: '17px', fontWeight: 600 }}>
              Rohiit Gupta · Chief Vedic Architect
            </span>
          </div>
          <div style={{
            color: '#64748B',
            fontSize: '14px',
            background: '#ffffff0A',
            padding: '8px 16px',
            borderRadius: '8px',
          }}>
            trikalvaani.com
          </div>
        </div>

        {/* Gold bottom border */}
        <div style={{ width: '100%', height: '4px', background: 'linear-gradient(90deg, #F59E0B, #FCD34D, #F59E0B)', display: 'flex' }} />
      </div>
    ),
    {
      width:  1200,
      height: 630,
    }
  );
}
