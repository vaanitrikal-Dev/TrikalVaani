/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 1.0 (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: 4-WEEK PREDICTION COMPONENT
 *
 * STRUCTURE:
 *   1. Overall 4-Week Score Chart (Career, Love, Wealth, Health, Peace %)
 *   2. Master Prediction — 1800-2000 words (Gemini, 4096 tokens)
 *   3. Week 1-4 breakdown with Upay + Precautions
 *   4. Date Alerts — specific important dates (good/bad)
 *
 * PLACEMENT: Inside ₹51 deep reading — below main prediction
 * LANGUAGE: Reads lang prop — Hindi/Hinglish/English
 */

'use client';

import { useEffect, useState, useRef } from 'react';

const GOLD        = '#D4AF37';
const GOLD_RGBA   = (a: number) => `rgba(212,175,55,${a})`;
const PURPLE      = '#7C3AED';
const PURPLE_RGBA = (a: number) => `rgba(124,58,237,${a})`;
const GREEN       = '#22C55E';
const GREEN_RGBA  = (a: number) => `rgba(34,197,94,${a})`;
const RED         = '#EF4444';
const RED_RGBA    = (a: number) => `rgba(239,68,68,${a})`;
const BLUE        = '#60A5FA';
const BLUE_RGBA   = (a: number) => `rgba(96,165,250,${a})`;
const ORANGE      = '#FB923C';
const ORANGE_RGBA = (a: number) => `rgba(251,146,60,${a})`;

type Lang = 'hindi' | 'hinglish' | 'english';

type Planet = {
  name: string;
  rashi: string;
  house: number;
  strength: number;
  isRetrograde: boolean;
  nakshatra: string;
  degree: number;
};

export type FourWeekPredictionProps = {
  name: string;
  lagna: string;
  mahadasha: string;
  antardasha: string;
  nakshatra: string;
  planets: Planet[];
  dob?: string;
  autoSegment?: string;
  autoSegmentLabel?: string;
  lang?: Lang;
  employment?: string;
  sector?: string;
};

// ─── PILLAR SCORES — calculated from natal chart ──────────────────────────────
function calcPillarScores(planets: Planet[], mahadasha: string, lagna: string): Record<string, number> {
  const get = (name: string) => planets.find(p => p.name === name);
  const jupiter = get('Jupiter');
  const venus   = get('Venus');
  const saturn  = get('Saturn');
  const sun     = get('Sun');
  const moon    = get('Moon');
  const mercury = get('Mercury');
  const mars    = get('Mars');

  const goodDasha = ['Jupiter','Venus','Mercury','Moon'].includes(mahadasha);
  const dashaBoost = goodDasha ? 8 : -5;

  const career = Math.min(99, Math.max(35,
    (sun?.strength     ?? 50) * 0.4 +
    (saturn?.strength  ?? 50) * 0.3 +
    (mercury?.strength ?? 50) * 0.3 +
    dashaBoost
  ));

  const love = Math.min(99, Math.max(35,
    (venus?.strength ?? 50) * 0.5 +
    (moon?.strength  ?? 50) * 0.3 +
    (jupiter?.strength ?? 50) * 0.2 +
    dashaBoost
  ));

  const wealth = Math.min(99, Math.max(35,
    (jupiter?.strength ?? 50) * 0.4 +
    (venus?.strength   ?? 50) * 0.3 +
    (mercury?.strength ?? 50) * 0.3 +
    dashaBoost
  ));

  const health = Math.min(99, Math.max(35,
    (sun?.strength  ?? 50) * 0.4 +
    (mars?.strength ?? 50) * 0.3 +
    (moon?.strength ?? 50) * 0.3 +
    (goodDasha ? 5 : -8)
  ));

  const peace = Math.min(99, Math.max(35,
    (moon?.strength    ?? 50) * 0.4 +
    (jupiter?.strength ?? 50) * 0.3 +
    (saturn?.strength  ?? 50) * 0.3 +
    dashaBoost
  ));

  const overall = Math.round((career + love + wealth + health + peace) / 5);

  return {
    overall,
    career:  Math.round(career),
    love:    Math.round(love),
    wealth:  Math.round(wealth),
    health:  Math.round(health),
    peace:   Math.round(peace),
  };
}

// ─── GEMINI PROMPT — 4 WEEK ───────────────────────────────────────────────────
function buildFourWeekPrompt(
  name: string,
  lagna: string,
  mahadasha: string,
  antardasha: string,
  nakshatra: string,
  planets: Planet[],
  segment: string,
  segmentLabel: string,
  lang: Lang,
  scores: Record<string, number>,
  employment?: string,
  sector?: string
): string {
  const langRule =
    lang === 'hindi'   ? 'शुद्ध हिंदी में लिखें (देवनागरी)। सूर्य, चंद्र, मंगल, बुध, गुरु, शुक्र, शनि, राहु, केतु — इन्हीं नामों का प्रयोग करें।' :
    lang === 'english' ? 'Write in warm, flowing English. Use Sanskrit terms with English translations.' :
                         'Write in Hinglish — natural Hindi-English mix. Use: Surya, Chandra, Mangal, Budh, Guru, Shukra, Shani, Rahu, Ketu for planets.';

  const planetStr = planets
    .map(p => `${p.name}: ${p.rashi} H${p.house}, ${p.nakshatra} ${p.degree}°, str=${p.strength}%${p.isRetrograde ? ' RETRO' : ''}`)
    .join('\n');

  const today     = new Date();
  const week1Start = new Date(today);
  const week2Start = new Date(today); week2Start.setDate(today.getDate() + 7);
  const week3Start = new Date(today); week3Start.setDate(today.getDate() + 14);
  const week4Start = new Date(today); week4Start.setDate(today.getDate() + 21);

  const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

  const employmentContext = employment
    ? `Employment: ${employment}${sector ? ` | Sector: ${sector}` : ''}`
    : '';

  return `You are Jini — the AI soul of Trikal Vaani by Rohiit Gupta ji.
Write a COMPLETE 4-WEEK MASTER PREDICTION for ${name}.

BIRTH CHART:
Name: ${name} | Lagna: ${lagna} | Mahadasha: ${mahadasha} | Antardasha: ${antardasha} | Nakshatra: ${nakshatra}
${employmentContext}
Life Focus: ${segmentLabel || segment}

PLANETS:
${planetStr}

TODAY'S GOCHAR (April 2026):
Venus EXALTED in Meen | Jupiter in Vrishabh | Saturn in Kumbh | Rahu in Meen | Ketu in Kanya
Sun+Mercury in Mesh | Mars in Mithun

CURRENT SCORES:
Career: ${scores.career}% | Love: ${scores.love}% | Wealth: ${scores.wealth}% | Health: ${scores.health}% | Peace: ${scores.peace}%

WEEK DATES:
Week 1: ${fmt(week1Start)} – ${fmt(week2Start)}
Week 2: ${fmt(week2Start)} – ${fmt(week3Start)}
Week 3: ${fmt(week3Start)} – ${fmt(week4Start)}
Week 4: ${fmt(week4Start)} onwards

OUTPUT FORMAT — follow EXACTLY, plain text, no markdown asterisks:

MASTER_PREDICTION:
[Write 400-500 words. This is the complete 4-week cosmic overview. Reference specific planets, their current positions, and how they interact with ${name}'s natal chart. Include: what the overall energy feels like this month, key themes across all 4 weeks, what Rohiit Gupta ji ka Trikal framework says about this specific phase. Be specific to this person's chart — not generic. Make it feel like a wise Guru who has studied this chart for years is speaking.]

WEEK_1:
ENERGY: [High/Medium/Low/Mixed]
PREDICTION: [100-120 words specific to this week. What happens, what to watch for.]
UPAY: [2-3 specific remedies for this week — day, mantra, color, gem, food donation etc.]
PRECAUTION: [1-2 specific things to avoid this week]

WEEK_2:
ENERGY: [High/Medium/Low/Mixed]
PREDICTION: [100-120 words]
UPAY: [2-3 remedies]
PRECAUTION: [1-2 precautions]

WEEK_3:
ENERGY: [High/Medium/Low/Mixed]
PREDICTION: [100-120 words]
UPAY: [2-3 remedies]
PRECAUTION: [1-2 precautions]

WEEK_4:
ENERGY: [High/Medium/Low/Mixed]
PREDICTION: [100-120 words]
UPAY: [2-3 remedies]
PRECAUTION: [1-2 precautions]

DATE_ALERTS:
[List 4-6 specific dates in the next 30 days that are significant for ${name}.
Format each as: DD Month YYYY | GOOD/WARNING | reason (1 line)
Base on: dasha transitions, gochar impacts, nakshatra padas, tithi significance]

CLOSING_BLESSING:
[2-3 lines — a warm, personal blessing from Jini. Reference their specific Lagna and Nakshatra. End with Rohiit Gupta ji ka Trikal framework tagline naturally.]

LANGUAGE RULE: ${langRule}
CRITICAL: Every statement must reference a specific planet or transit. No generic astrology. Speak directly to ${name.split(' ')[0]}.`;
}

// ─── PARSER ───────────────────────────────────────────────────────────────────
interface WeekData {
  energy: string;
  prediction: string;
  upay: string;
  precaution: string;
}

interface FourWeekData {
  masterPrediction: string;
  weeks: [WeekData, WeekData, WeekData, WeekData];
  dateAlerts: { date: string; type: 'GOOD' | 'WARNING'; reason: string }[];
  closingBlessing: string;
}

function parseFourWeek(raw: string): FourWeekData {
  const get = (key: string): string => {
    const m = raw.match(new RegExp(`${key}[:\\s]*([\\s\\S]*?)(?=\\n[A-Z_]+[:\\s]|$)`, 'i'));
    return m?.[1]?.trim() ?? '';
  };

  const getWeek = (n: number): WeekData => {
    const weekBlock = raw.match(
      new RegExp(`WEEK_${n}[:\\s]*([\\s\\S]*?)(?=WEEK_${n+1}|DATE_ALERTS|$)`, 'i')
    )?.[1] ?? '';

    const getField = (field: string) => {
      const m = weekBlock.match(new RegExp(`${field}[:\\s]*([^\\n]+(?:\\n(?![A-Z_]+:)[^\\n]+)*)`, 'i'));
      return m?.[1]?.trim() ?? '';
    };

    return {
      energy:     getField('ENERGY'),
      prediction: getField('PREDICTION'),
      upay:       getField('UPAY'),
      precaution: getField('PRECAUTION'),
    };
  };

  // Parse date alerts
  const alertsRaw = get('DATE_ALERTS');
  const dateAlerts: FourWeekData['dateAlerts'] = [];
  const alertLines = alertsRaw.split('\n').filter(l => l.trim());
  for (const line of alertLines) {
    const m = line.match(/(.+?)\|\s*(GOOD|WARNING|BAD)\s*\|\s*(.+)/i);
    if (m) {
      dateAlerts.push({
        date:   m[1]?.trim() ?? '',
        type:   m[2]?.toUpperCase() === 'GOOD' ? 'GOOD' : 'WARNING',
        reason: m[3]?.trim() ?? '',
      });
    }
  }

  const masterPrediction = get('MASTER_PREDICTION');

  return {
    masterPrediction: masterPrediction.length > 30 ? masterPrediction : raw.trim(),
    weeks: [getWeek(1), getWeek(2), getWeek(3), getWeek(4)],
    dateAlerts,
    closingBlessing: get('CLOSING_BLESSING'),
  };
}

// ─── SCORE BAR ────────────────────────────────────────────────────────────────
function ScoreBar({
  label, score, color, emoji, delay = 0,
}: { label: string; score: number; color: string; emoji: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 200 + delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  const getLabel = (s: number) =>
    s >= 80 ? 'Excellent' : s >= 65 ? 'Good' : s >= 50 ? 'Average' : 'Needs attention';

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>{emoji}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(226,232,240,0.8)' }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: `${color}99` }}>{getLabel(score)}</span>
          <span style={{ fontSize: 14, fontWeight: 800, color }}>{score}%</span>
        </div>
      </div>
      <div style={{
        height: 7, borderRadius: 4,
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${width}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}60, ${color})`,
          borderRadius: 4,
          transition: `width 1.2s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
          boxShadow: `0 0 8px ${color}40`,
        }} />
      </div>
    </div>
  );
}

// ─── ENERGY BADGE ─────────────────────────────────────────────────────────────
function EnergyBadge({ energy }: { energy: string }) {
  const e = energy.toUpperCase();
  const config =
    e.includes('HIGH')   ? { color: GREEN,  bg: GREEN_RGBA(0.12),  border: GREEN_RGBA(0.3),  label: '⚡ High Energy' } :
    e.includes('LOW')    ? { color: RED,    bg: RED_RGBA(0.12),    border: RED_RGBA(0.3),    label: '🌙 Low Energy' } :
    e.includes('MIXED')  ? { color: ORANGE, bg: ORANGE_RGBA(0.12), border: ORANGE_RGBA(0.3), label: '🌊 Mixed Energy' } :
                           { color: BLUE,   bg: BLUE_RGBA(0.12),   border: BLUE_RGBA(0.3),   label: '✨ Medium Energy' };

  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      background: config.bg,
      border: `1px solid ${config.border}`,
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      color: config.color,
    }}>
      {config.label}
    </span>
  );
}

// ─── WEEK CARD ────────────────────────────────────────────────────────────────
function WeekCard({
  weekNum, week, lang, startDate,
}: { weekNum: number; week: WeekData; lang: Lang; startDate: Date }) {
  const [expanded, setExpanded] = useState(weekNum === 1);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const weekColors = [GOLD, BLUE, GREEN, PURPLE];
  const color = weekColors[weekNum - 1] ?? GOLD;

  const weekLabel =
    lang === 'hindi'   ? `सप्ताह ${weekNum}` :
    lang === 'english' ? `Week ${weekNum}` :
                         `Week ${weekNum}`;

  return (
    <div style={{
      background: 'rgba(6,12,28,0.8)',
      border: `1px solid ${color}25`,
      borderRadius: 14,
      overflow: 'hidden',
      marginBottom: 8,
    }}>
      {/* Week header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', padding: '14px 18px',
          background: expanded ? `${color}08` : 'transparent',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${color}18`,
            border: `1px solid ${color}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color,
          }}>
            {weekNum}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(226,232,240,0.9)' }}>
              {weekLabel}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)', marginTop: 1 }}>
              {fmt(startDate)} – {fmt(endDate)}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {week.energy && <EnergyBadge energy={week.energy} />}
          <span style={{ fontSize: 12, color: 'rgba(148,163,184,0.4)', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>▼</span>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '0 18px 18px' }}>
          {/* Prediction */}
          {week.prediction && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: 'rgba(226,232,240,0.88)' }}>
                {week.prediction}
              </p>
            </div>
          )}

          {/* Upay */}
          {week.upay && (
            <div style={{
              padding: '12px 14px',
              background: GREEN_RGBA(0.06),
              border: `1px solid ${GREEN_RGBA(0.2)}`,
              borderRadius: 10, marginBottom: 8,
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: GREEN_RGBA(0.7),
                textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6,
              }}>
                🙏 {lang === 'hindi' ? 'इस सप्ताह के उपाय' : lang === 'english' ? 'Remedies this week' : 'Is week ke Upay'}
              </div>
              <p style={{ fontSize: 13, color: 'rgba(226,232,240,0.82)', lineHeight: 1.7, whiteSpace: 'pre-line' as const }}>
                {week.upay}
              </p>
            </div>
          )}

          {/* Precaution */}
          {week.precaution && (
            <div style={{
              padding: '12px 14px',
              background: RED_RGBA(0.06),
              border: `1px solid ${RED_RGBA(0.2)}`,
              borderRadius: 10,
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: RED_RGBA(0.7),
                textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6,
              }}>
                ⚠️ {lang === 'hindi' ? 'सावधानी' : lang === 'english' ? 'Precautions' : 'Precautions'}
              </div>
              <p style={{ fontSize: 13, color: 'rgba(226,232,240,0.82)', lineHeight: 1.7 }}>
                {week.precaution}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DATE ALERT CARD ──────────────────────────────────────────────────────────
function DateAlertCard({ alert }: { alert: FourWeekData['dateAlerts'][0] }) {
  const isGood = alert.type === 'GOOD';
  const color  = isGood ? GREEN : RED;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '10px 14px',
      background: isGood ? GREEN_RGBA(0.06) : RED_RGBA(0.06),
      border: `1px solid ${isGood ? GREEN_RGBA(0.2) : RED_RGBA(0.2)}`,
      borderRadius: 10, marginBottom: 6,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: isGood ? GREEN_RGBA(0.12) : RED_RGBA(0.12),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14,
      }}>
        {isGood ? '🌟' : '⚠️'}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 3 }}>
          {alert.date}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.75)', lineHeight: 1.55 }}>
          {alert.reason}
        </div>
      </div>
    </div>
  );
}

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────
function LoadingSkeleton({ lang }: { lang: Lang }) {
  return (
    <div style={{ padding: '28px 24px', textAlign: 'center' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
        background: `radial-gradient(circle, ${GOLD_RGBA(0.25)}, ${PURPLE_RGBA(0.15)})`,
        border: `2px solid ${GOLD_RGBA(0.35)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, animation: 'pulse4w 2s infinite',
      }}>
        📅
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: GOLD, marginBottom: 6 }}>
        {lang === 'hindi' ? 'जिनी 4-सप्ताह का विश्लेषण तैयार कर रही है...'
         : lang === 'english' ? 'Jini is preparing your 4-week forecast...'
         : 'Jini 4-week analysis taiyaar kar rahi hai...'}
      </p>
      <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.5)', marginBottom: 20 }}>
        {lang === 'hindi' ? 'ग्रह स्थिति + दशा + गोचर + उपाय = संपूर्ण मार्गदर्शन'
         : lang === 'english' ? 'Planets + Dasha + Gochar + Remedies = Complete guidance'
         : 'Planets + Dasha + Gochar + Upay = Complete guidance'}
      </p>
      {/* Shimmer bars */}
      {[100, 85, 92, 78, 88].map((w, i) => (
        <div key={i} style={{
          height: 10, borderRadius: 5, margin: '8px auto',
          width: `${w}%`, background: GOLD_RGBA(0.08),
          animation: `shimmer4w 1.5s infinite ${i * 0.1}s`,
        }} />
      ))}
      <style>{`
        @keyframes pulse4w { 0%,100%{box-shadow:0 0 20px ${GOLD_RGBA(0.2)}} 50%{box-shadow:0 0 40px ${GOLD_RGBA(0.4)}} }
        @keyframes shimmer4w { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
      `}</style>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function FourWeekPrediction({
  name, lagna, mahadasha, antardasha, nakshatra,
  planets, dob,
  autoSegment = 'default', autoSegmentLabel = '',
  lang = 'hinglish',
  employment, sector,
}: FourWeekPredictionProps) {

  const [data, setData]       = useState<FourWeekData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores]   = useState<Record<string, number>>({});
  const [visible, setVisible] = useState(false);
  const fetched = useRef(false);

  const today      = new Date();
  const week2Start = new Date(today); week2Start.setDate(today.getDate() + 7);
  const week3Start = new Date(today); week3Start.setDate(today.getDate() + 14);
  const week4Start = new Date(today); week4Start.setDate(today.getDate() + 21);
  const weekStarts = [today, week2Start, week3Start, week4Start];

  useEffect(() => {
    if (fetched.current || !planets.length) return;
    fetched.current = true;

    const s = calcPillarScores(planets, mahadasha, lagna);
    setScores(s);
    setVisible(true);

    const prompt = buildFourWeekPrompt(
      name, lagna, mahadasha, antardasha, nakshatra,
      planets, autoSegment, autoSegmentLabel, lang, s,
      employment, sector
    );

    fetch('/api/jini-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt, mode: 'four_week', lang }),
    })
      .then(r => r.json())
      .then(d => {
        const reply = d.reply ?? '';
        if (reply.length > 100) {
          setData(parseFourWeek(reply));
        } else {
          // Fallback structure
          setData({
            masterPrediction: `${name.split(' ')[0]} ji, aapka ${lagna} Lagna aur ${mahadasha} Mahadasha — agले 4 hafte ek mahtvapurna cosmic phase mein hain. Venus uchcha aur Jupiter ka position aapke liye ek rare opportunity create kar raha hai. Rohiit Gupta ji ka Trikal framework kehta hai — yeh waqt seedhi mehnat ka hai, results zaroor milenge.`,
            weeks: [
              { energy: 'High', prediction: 'Pehla hafte energy high hai — naye kaam shuru karne ka sahi waqt.', upay: 'Shukrawar ko safed phool Mata ko chadhayein. Hare rang ka istemal karein.', precaution: 'Gusse par kabu rakhen. Kisi se bada vivaad mat karein.' },
              { energy: 'Mixed', prediction: 'Doosra hafte mixed energy — sabr zaroori hai. Koi bhi bada faisla soch samajhkar lein.', upay: 'Shanivaar ko Shani ko tel chadhayein. Neele rang ka kapda pehnen.', precaution: 'Financial decisions mein jaldbaazi na karein.' },
              { energy: 'High', prediction: 'Teesra hafte phir se energy positive — relationships mein sudhar aayega.', upay: 'Somvaar ko Shivji ko jal chadhayein. Safed cheezein daan karein.', precaution: 'Health par dhyan dein — neend pooree lein.' },
              { energy: 'Medium', prediction: 'Chautha hafte planning ka waqt hai — agle mahine ki taiyaari karein.', upay: 'Guruvaar ko peele phool mandir mein chadhayein. Haldi ka istemal karein.', precaution: 'Kisi par blindly trust mat karein — verification zaroori hai.' },
            ] as [WeekData, WeekData, WeekData, WeekData],
            dateAlerts: [],
            closingBlessing: `${name.split(' ')[0]} ji — aapka ${lagna} Lagna aur ${nakshatra} Nakshatra bahut powerful combination hai. Rohiit Gupta ji ka Trikal framework kehta hai — "Kaal bada balwan hai, aur aapka Kaal abhi bahut shubh hai." 🙏`,
          });
        }
      })
      .catch(() => {
        setData({
          masterPrediction: `${name.split(' ')[0]} ji, yeh 4-week period aapke ${mahadasha} Mahadasha ka ek important phase hai. Trikal framework ke anusaar, abhi action ka waqt hai.`,
          weeks: [
            { energy: 'Medium', prediction: 'Pehla hafte kaafi important hai.', upay: 'Subah Surya ko jal chadhayein.', precaution: 'Jaldbaazi se bachein.' },
            { energy: 'Mixed', prediction: 'Doosra hafte mixed signals.', upay: 'Shani ko tel chadhayein.', precaution: 'Financial caution.' },
            { energy: 'High', prediction: 'Teesra hafte better hoga.', upay: 'Guru mantra jaapen.', precaution: 'Health dekhen.' },
            { energy: 'Medium', prediction: 'Chautha hafte planning.', upay: 'Daan karein.', precaution: 'Trust carefully.' },
          ] as [WeekData, WeekData, WeekData, WeekData],
          dateAlerts: [],
          closingBlessing: 'Kaal bada balwan hai — aur aapka Kaal aapki Kundali mein likha hai. 🙏',
        });
      })
      .finally(() => setLoading(false));
  }, [name, lagna, mahadasha, planets.length]);

  const PILLAR_CONFIG = [
    { key: 'career', label: lang === 'hindi' ? 'करियर' : 'Career', emoji: '💼', color: BLUE },
    { key: 'love',   label: lang === 'hindi' ? 'प्रेम' : 'Love',   emoji: '💕', color: '#F472B6' },
    { key: 'wealth', label: lang === 'hindi' ? 'धन' : 'Wealth',   emoji: '💰', color: GOLD },
    { key: 'health', label: lang === 'hindi' ? 'स्वास्थ्य' : 'Health', emoji: '🌿', color: GREEN },
    { key: 'peace',  label: lang === 'hindi' ? 'शांति' : 'Peace',  emoji: '🕊️', color: PURPLE },
  ];

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.8s ease, transform 0.8s ease',
    }}>

      {/* ── SECTION HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 12,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: GOLD_RGBA(0.12),
          border: `1px solid ${GOLD_RGBA(0.3)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>📅</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>
            {lang === 'hindi' ? '4-सप्ताह का मास्टर विश्लेषण' : lang === 'english' ? '4-Week Master Forecast' : '4-Week Master Forecast'}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)' }}>
            {lang === 'hindi' ? 'ग्रह + दशा + गोचर + उपाय' : 'Planets + Dasha + Gochar + Upay'}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div style={{
            padding: '3px 10px',
            background: PURPLE_RGBA(0.12),
            border: `1px solid ${PURPLE_RGBA(0.3)}`,
            borderRadius: 20, fontSize: 10, color: '#C4B5FD', fontWeight: 600,
          }}>
            ✨ AI Generated
          </div>
        </div>
      </div>

      {/* ── OVERALL SCORE CHART ── */}
      {Object.keys(scores).length > 0 && (
        <div style={{
          background: 'rgba(6,12,28,0.95)',
          border: `1px solid ${GOLD_RGBA(0.15)}`,
          borderRadius: 16, padding: '20px 22px',
          marginBottom: 10,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Top shimmer */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: `linear-gradient(90deg, transparent, ${GOLD_RGBA(0.5)}, transparent)`,
          }} />

          {/* Overall score circle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
              background: `conic-gradient(${GOLD} ${(scores.overall ?? 72) * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: '50%',
                background: 'rgba(6,12,28,0.98)',
                display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: GOLD, lineHeight: 1 }}>
                  {scores.overall ?? 72}%
                </span>
                <span style={{ fontSize: 8, color: GOLD_RGBA(0.6), lineHeight: 1 }}>Overall</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
                {lang === 'hindi' ? `${name.split(' ')[0]} जी का 4-सप्ताह स्कोर` : `${name.split(' ')[0]}'s 4-Week Score`}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.55)' }}>
                {lang === 'hindi'
                  ? 'जन्म कुंडली + आज का गोचर + दशा विश्लेषण'
                  : 'Based on natal chart + current Gochar + Dasha'}
              </div>
            </div>
          </div>

          {/* Score bars */}
          {PILLAR_CONFIG.map((p, i) => (
            <ScoreBar
              key={p.key}
              label={p.label}
              score={scores[p.key] ?? 70}
              color={p.color}
              emoji={p.emoji}
              delay={i * 150}
            />
          ))}
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15,5,40,0.97), rgba(6,12,28,0.99))',
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 10,
      }}>
        {loading ? (
          <LoadingSkeleton lang={lang} />
        ) : data ? (
          <div>
            {/* Master prediction */}
            {data.masterPrediction && (
              <div style={{ padding: '22px 22px 0' }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const,
                  letterSpacing: '0.07em', color: GOLD_RGBA(0.55), marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span>🔮</span>
                  {lang === 'hindi' ? 'मास्टर भविष्यवाणी — संपूर्ण 4 सप्ताह'
                   : lang === 'english' ? 'Master Prediction — Complete 4 Weeks'
                   : 'Master Prediction — Complete 4 Weeks'}
                </div>
                <div style={{
                  fontSize: 14, lineHeight: 1.85,
                  color: 'rgba(226,232,240,0.9)',
                  paddingBottom: 20,
                  borderBottom: `1px solid rgba(255,255,255,0.06)`,
                }}>
                  {data.masterPrediction}
                </div>
              </div>
            )}

            {/* Week cards */}
            <div style={{ padding: '16px 22px 0' }}>
              <div style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const,
                letterSpacing: '0.07em', color: GOLD_RGBA(0.55), marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>📆</span>
                {lang === 'hindi' ? 'सप्ताह-वार विश्लेषण + उपाय'
                 : lang === 'english' ? 'Week-by-Week + Remedies'
                 : 'Week-by-Week + Upay'}
              </div>
              {data.weeks.map((week, i) => (
                <WeekCard
                  key={i}
                  weekNum={i + 1}
                  week={week}
                  lang={lang}
                  startDate={weekStarts[i]!}
                />
              ))}
            </div>

            {/* Date alerts */}
            {data.dateAlerts.length > 0 && (
              <div style={{ padding: '16px 22px 0' }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const,
                  letterSpacing: '0.07em', marginBottom: 10,
                  display: 'flex', alignItems: 'center', gap: 6,
                  color: 'rgba(148,163,184,0.5)',
                }}>
                  <span>🔔</span>
                  {lang === 'hindi' ? 'महत्वपूर्ण तारीखें — अलर्ट'
                   : lang === 'english' ? 'Important Date Alerts'
                   : 'Important Date Alerts'}
                </div>
                {data.dateAlerts.map((alert, i) => (
                  <DateAlertCard key={i} alert={alert} />
                ))}
              </div>
            )}

            {/* Closing blessing */}
            {data.closingBlessing && (
              <div style={{
                margin: '16px 22px 0',
                padding: '14px 16px',
                background: GOLD_RGBA(0.05),
                border: `1px solid ${GOLD_RGBA(0.12)}`,
                borderRadius: 12,
                fontSize: 13, lineHeight: 1.7,
                color: GOLD_RGBA(0.8),
                fontStyle: 'italic',
              }}>
                🙏 {data.closingBlessing}
              </div>
            )}

            {/* Call CTA */}
            <div style={{ padding: '16px 22px 22px' }}>
              <div style={{
                padding: '14px 18px',
                background: 'rgba(124,58,237,0.08)',
                border: `1px solid ${PURPLE_RGBA(0.25)}`,
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#C4B5FD', marginBottom: 3 }}>
                    {lang === 'hindi' ? '🔮 और गहरी जानकारी चाहिए?'
                     : lang === 'english' ? '🔮 Want even deeper insights?'
                     : '🔮 Aur gehri jaankari chahiye?'}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.55)' }}>
                    {lang === 'hindi'
                      ? 'Rohiit Gupta ji के साथ 8-10 मिनट की personal call — ₹499 only'
                      : 'Personal 8-10 min call with Rohiit Gupta ji — ₹499 only'}
                  </div>
                </div>
                <a
                  href="/services/personal-call"
                  style={{
                    padding: '8px 16px', flexShrink: 0,
                    background: `linear-gradient(135deg, ${PURPLE}, #5B21B6)`,
                    borderRadius: 8, textDecoration: 'none',
                    fontSize: 12, fontWeight: 700, color: '#fff',
                    whiteSpace: 'nowrap' as const,
                  }}
                >
                  Book Call →
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
