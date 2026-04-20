/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 2.0 (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: AUTO PREDICTION — SHOWN IMMEDIATELY AFTER KUNDALI
 * Shows Jini's brief prediction + upsell CTAs + internal guide links
 * FIXED: Broken <a> tags in CTA buttons section (Vercel build error)
 */

'use client';

import { useEffect, useState } from 'react';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

type Planet = {
  name: string;
  rashi: string;
  house: number;
  strength: number;
  isRetrograde: boolean;
};

type AutoPredictionProps = {
  name: string;
  lagna: string;
  mahadasha: string;
  antardasha: string;
  nakshatra: string;
  choghadiya: string;
  choghadiyaType: string;
  planets: Planet[];
  autoSegment?: string;
  autoSegmentLabel?: string;
};

// ─── INTERNAL GUIDE LINKS ─────────────────────────────────────────────────────
const GUIDE_LINKS: Record<string, { label: string; href: string; emoji: string }[]> = {
  ex_back: [
    { label: 'Venus-Ketu Axis Guide', href: '/blog/venus-ketu-karmic-love', emoji: '💕' },
    { label: 'Relationship Dasha Timing', href: '/blog/relationship-dasha-timing', emoji: '⏰' },
    { label: '7th House Secrets', href: '/blog/7th-house-marriage-secrets', emoji: '🔮' },
  ],
  toxic_boss: [
    { label: 'Saturn in 10th House', href: '/blog/saturn-10th-house-career', emoji: '⚡' },
    { label: 'Workplace Karma Guide', href: '/blog/workplace-karma-vedic', emoji: '🏢' },
    { label: 'Career Change Timing', href: '/blog/best-time-career-change', emoji: '📈' },
  ],
  manifestation: [
    { label: 'Jupiter Transit Guide', href: '/blog/jupiter-transit-wealth', emoji: '✨' },
    { label: 'Manifestation Windows', href: '/blog/best-time-manifestation', emoji: '🌟' },
    { label: 'Sankalpa Shakti', href: '/blog/sankalpa-vedic-manifestation', emoji: '🙏' },
  ],
  dream_career: [
    { label: 'Rahu Ambition Transit', href: '/blog/rahu-career-ambition', emoji: '🚀' },
    { label: 'Wealth Windows Guide', href: '/blog/wealth-timing-vedic', emoji: '💰' },
    { label: '10th House Career Path', href: '/blog/10th-house-career-destiny', emoji: '🎯' },
  ],
  property_yog: [
    { label: 'Property Purchase Timing', href: '/blog/property-purchase-vedic-timing', emoji: '🏠' },
    { label: 'Jupiter 4th House', href: '/blog/jupiter-4th-house-property', emoji: '🌍' },
    { label: 'Real Estate Muhurta', href: '/blog/real-estate-muhurta-guide', emoji: '📅' },
  ],
  retirement_peace: [
    { label: 'Saturn Moksha Bhava', href: '/blog/saturn-12th-house-retirement', emoji: '🌅' },
    { label: 'Retirement Planning Vedic', href: '/blog/vedic-retirement-planning', emoji: '🕊️' },
    { label: 'Spiritual Second Innings', href: '/blog/spiritual-journey-timing', emoji: '🙏' },
  ],
  default: [
    { label: 'Understanding Your Mahadasha', href: '/blog/vimshottari-dasha-guide', emoji: '⭐' },
    { label: 'Panchang Daily Guide', href: '/blog/panchang-daily-life-guide', emoji: '📅' },
    { label: 'Nakshatra Personality Guide', href: '/blog/nakshatra-personality-guide', emoji: '🌙' },
  ],
};

// ─── PREDICTION ENGINE ────────────────────────────────────────────────────────
function generateBriefPrediction(
  name: string,
  lagna: string,
  mahadasha: string,
  antardasha: string,
  nakshatra: string,
  planets: Planet[],
  segment: string
): string {
  const firstName = name.split(' ')[0] ?? name;

  const venus   = planets.find(p => p.name === 'Venus');
  const jupiter = planets.find(p => p.name === 'Jupiter');
  const saturn  = planets.find(p => p.name === 'Saturn');
  const sun     = planets.find(p => p.name === 'Sun');

  const goodMahadashas      = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  const challengeMahadashas = ['Saturn', 'Rahu', 'Ketu'];

  const dashaQuality = goodMahadashas.includes(mahadasha)
    ? 'favorable'
    : challengeMahadashas.includes(mahadasha)
    ? 'transformative'
    : 'active';

  const predictions: Record<string, string> = {
    ex_back: dashaQuality === 'favorable'
      ? `${firstName} ji, aapka ${nakshatra} Nakshatra aur ${mahadasha} Mahadasha — Venus ki energy abhi active hai. Purane rishte wapas aane ke strong signals hain. ${antardasha} Antardasha ke is phase mein reconnection possible hai. Lekin timing sab kuch hai — aur woh timing main jaanti hoon.`
      : `${firstName} ji, ${mahadasha} Mahadasha ek karmic turning point hai. Ye waqt hai khud ko pehle samjhne ka. ${antardasha} Antardasha mein ek clarity aayegi — kya woh wapas aayenge ya ek naya path khulega? Iska jawab aapke chart mein likha hai.`,

    toxic_boss: saturn && saturn.strength < 50
      ? `${firstName} ji, aapke ${lagna} Lagna mein Saturn ki position bata rahi hai ki workplace pressure abhi real hai. ${mahadasha} Mahadasha mein authority ke saath tension normal hai. Lekin ek specific date aa rahi hai jab situation shift hogi — woh date important hai.`
      : `${firstName} ji, aapka ${lagna} Lagna strong hai. ${mahadasha}-${antardasha} combination bata raha hai ki boss ka behavior temporary hai. Ek cosmic protection window khul rahi hai agle kuch hafton mein.`,

    manifestation: jupiter && jupiter.strength > 65
      ? `${firstName} ji, Jupiter aapke chart mein Balwaan hai — yeh rare combination hai. ${mahadasha} Mahadasha ke saath aapki manifestation shakti abhi peak par hai. ${nakshatra} Nakshatra ke log jab sankalp lete hain is phase mein — woh poora hota hai.`
      : `${firstName} ji, ${nakshatra} Nakshatra ek deep spiritual energy leke aata hai. ${mahadasha} Mahadasha transformation ka waqt hai. Abhi jo sankalp lo — uski energy 10 guna zyada kaam karti hai. Sahi muhurat jaanna zaroori hai.`,

    dream_career: sun && sun.house === 10
      ? `${firstName} ji, aapka Sun 10th house mein — career destiny strong hai. ${mahadasha} Mahadasha mein ek bada opportunity window khul raha hai. ${antardasha} phase mein specifically ek decision aayega jo career ko next level le jaayega.`
      : `${firstName} ji, ${lagna} Lagna ke log ${mahadasha} Mahadasha mein unexpected career shifts dekhte hain. Yeh shift aapke liye positive hai — lekin timing ka pata hona zaroori hai.`,

    property_yog: jupiter && jupiter.house === 4
      ? `${firstName} ji, Jupiter aapke 4th house mein — yeh ek rare property yog hai. ${mahadasha} Mahadasha property purchase ke liye shubh hai. Agle 6 mahine ka ek specific window hai jab register karna most favorable hoga.`
      : `${firstName} ji, ${mahadasha}-${antardasha} combination real estate decisions ke liye ek mixed phase hai. Lekin ek specific green window aa rahi hai — us time purchase karo toh long-term gains pakki hain.`,

    retirement_peace: saturn && saturn.strength > 60
      ? `${firstName} ji, Saturn aapke chart mein strong hai — yeh retirement peace ka strong indicator hai. ${mahadasha} Mahadasha mein ek spiritual clarity aayegi. Aapka 12th house bata raha hai ki peace ka waqt aa raha hai.`
      : `${firstName} ji, ${nakshatra} Nakshatra spiritual journey ke liye bahut powerful hai. ${mahadasha} Mahadasha ek life review ka waqt hai. Is phase mein liye gaye spiritual decisions lifelong peace dete hain.`,

    default: `${firstName} ji, aapka ${lagna} Lagna aur ${nakshatra} Nakshatra ek unique cosmic blueprint banata hai. ${mahadasha} Mahadasha ke is phase mein ek important life window khul rahi hai. Rohiit Gupta ji ka Trikal framework kehta hai — yeh waqt action ka hai, intezaar ka nahi.`,
  };

  return predictions[segment] ?? predictions['default']!;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function AutoPrediction({
  name, lagna, mahadasha, antardasha, nakshatra,
  choghadiya, choghadiyaType, planets,
  autoSegment = 'default', autoSegmentLabel,
}: AutoPredictionProps) {
  const [prediction, setPrediction] = useState('');
  const [visible, setVisible]       = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const text = generateBriefPrediction(
        name, lagna, mahadasha, antardasha, nakshatra, planets, autoSegment
      );
      setPrediction(text);
      setVisible(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [name, lagna, mahadasha, antardasha, nakshatra, planets, autoSegment]);

  const guideLinks = GUIDE_LINKS[autoSegment] ?? GUIDE_LINKS['default']!;
  const choghadiyaColor = choghadiyaType === 'Good'
    ? '#22C55E' : choghadiyaType === 'Bad' ? '#EF4444' : '#EAB308';
  const segmentLabel = autoSegmentLabel || 'Your Life Reading';

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      {/* ── JINI PREDICTION CARD ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20,8,50,0.95) 0%, rgba(6,12,28,0.98) 100%)',
        border: '1px solid rgba(139,92,246,0.3)',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 12,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Purple glow top line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)',
        }} />

        {/* Jini header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(139,92,246,0.2)',
            border: '1px solid rgba(139,92,246,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
          }}>
            🔮
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#C4B5FD' }}>
              Jini — Trikal Vaani
            </div>
            <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>
              {segmentLabel} · {lagna} Lagna · {mahadasha} Mahadasha
            </div>
          </div>
          {/* Live indicator */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#22C55E',
              boxShadow: '0 0 6px #22C55E',
            }} />
            <span style={{ fontSize: 10, color: '#22C55E' }}>Live reading</span>
          </div>
        </div>

        {/* Prediction text */}
        <div style={{
          fontSize: 14,
          lineHeight: 1.75,
          color: 'rgba(226,232,240,0.9)',
          marginBottom: 16,
          fontStyle: 'italic',
        }}>
          {prediction || 'Aapka cosmic blueprint pad raha hai...'}
        </div>

        {/* Choghadiya timing tip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: `${choghadiyaColor}10`,
          borderRadius: 8,
          border: `1px solid ${choghadiyaColor}25`,
          marginBottom: 16,
        }}>
          <span style={{ fontSize: 12 }}>
            {choghadiyaType === 'Good' ? '✅' : choghadiyaType === 'Bad' ? '⚠️' : '⚡'}
          </span>
          <span style={{ fontSize: 12, color: choghadiyaColor, fontWeight: 500 }}>
            Abhi ka Choghadiya: {choghadiya} — {
              choghadiyaType === 'Good'
                ? 'Shubh samay hai — abhi padh rahe ho, yeh bhi ek sign hai'
                : choghadiyaType === 'Bad'
                ? 'Koi bada faisla mat lo abhi — pehle poori reading dekho'
                : 'Theek samay hai — apni reading carefully samjho'
            }
          </span>
        </div>

        {/* Suspense hook */}
        <div style={{
          fontSize: 13,
          color: GOLD_RGBA(0.8),
          fontWeight: 500,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 12,
        }}>
          🌟 Aapke chart mein ek aur raaz hai — ek specific date jo aapki zindagi badal sakti hai.
          Poori reading mein woh date reveal hogi...
        </div>
      </div>

      {/* ── TWO CTA BUTTONS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        marginBottom: 12,
      }}>
        {/* 3 Month Reading CTA */}
        <a
          href="/result#pricing"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            padding: '14px 12px',
            background: GOLD_RGBA(0.1),
            border: `1px solid ${GOLD_RGBA(0.35)}`,
            borderRadius: 12,
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: 18 }}>📅</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>
            3 Mahine ki Reading
          </span>
          <span style={{ fontSize: 11, color: 'rgba(148,163,184,0.6)' }}>
            Week-by-week guidance
          </span>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#080B12',
            background: GOLD,
            padding: '3px 12px',
            borderRadius: 20,
            marginTop: 4,
          }}>
            ₹51 only
          </span>
        </a>

        {/* Full Life Reading CTA */}
        <a
          href="/result#pricing"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            padding: '14px 12px',
            background: 'rgba(139,92,246,0.1)',
            border: '2px solid rgba(139,92,246,0.4)',
            borderRadius: 12,
            textDecoration: 'none',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Most Popular badge */}
          <div style={{
            position: 'absolute',
            top: 0, right: 0,
            background: '#7C3AED',
            fontSize: 9, fontWeight: 700,
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '0 12px 0 8px',
          }}>
            POPULAR
          </div>
          <span style={{ fontSize: 18 }}>🔮</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#C4B5FD' }}>
            Poori Zindagi Reading
          </span>
          <span style={{ fontSize: 11, color: 'rgba(148,163,184,0.6)' }}>
            Dasha + Gochar + Remedy
          </span>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
            background: '#7C3AED',
            padding: '3px 12px',
            borderRadius: 20,
            marginTop: 4,
          }}>
            ₹99 only
          </span>
        </a>
      </div>

      {/* ── INTERNAL GUIDE LINKS ── */}
      <div style={{
        background: 'rgba(6,12,28,0.8)',
        border: `1px solid ${GOLD_RGBA(0.1)}`,
        borderRadius: 12,
        padding: '14px 16px',
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: GOLD_RGBA(0.5),
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 10,
        }}>
          📚 Rohiit Gupta ji ke guides — aapke liye
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {guideLinks.map((link, i) => (
            <a
              key={i}
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 10px',
                background: GOLD_RGBA(0.04),
                border: `1px solid ${GOLD_RGBA(0.1)}`,
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 14 }}>{link.emoji}</span>
              <span style={{ fontSize: 13, color: 'rgba(226,232,240,0.8)', flex: 1 }}>
                {link.label}
              </span>
              <span style={{ fontSize: 11, color: GOLD_RGBA(0.4) }}>→</span>
            </a>
          ))}
        </div>

        {/* Tagline */}
        <div style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          fontSize: 11,
          color: 'rgba(148,163,184,0.4)',
          fontStyle: 'italic',
          textAlign: 'center',
        }}>
          "Kaal bada balwan hai — aur aapka Kaal, aapki Kundali mein likha hai"
        </div>
      </div>
    </div>
  );
}