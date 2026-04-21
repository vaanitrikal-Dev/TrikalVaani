/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 2.0 (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: TRIKAL INTELLIGENCE ENGINE — 3-LAYER PERSONALIZED PREDICTION
 *
 * LAYER 1: Natal chart (birth data) — who they ARE
 * LAYER 2: Current Gochar (today's transits) — what's happening NOW
 * LAYER 3: Gemini synthesis — what it MEANS for them
 *
 * FREE TIER:  3 lines max — maximum suspense, minimum reveal
 * PAID ₹51:   "Jini preparing — 2 minutes" → full deep reading
 * DUAL CHART: Red flag score + narrative (paid), suspense hook (free)
 *
 * POSITION: Below 3-Month Summary header (yellow arrow area)
 */

'use client';

import { useEffect, useState, useRef } from 'react';

const GOLD        = '#D4AF37';
const GOLD_RGBA   = (a: number) => `rgba(212,175,55,${a})`;
const PURPLE      = '#7C3AED';
const PURPLE_RGBA = (a: number) => `rgba(124,58,237,${a})`;
const RED         = '#EF4444';
const RED_RGBA    = (a: number) => `rgba(239,68,68,${a})`;
const GREEN       = '#22C55E';
const GREEN_RGBA  = (a: number) => `rgba(34,197,94,${a})`;

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

// ─── CURRENT GOCHAR — April 2026 ─────────────────────────────────────────────
// Update monthly or wire to live Prokerala gochar API
const CURRENT_GOCHAR: Record<string, { rashi: string; effect: string }> = {
  Sun:     { rashi: 'Mesh',     effect: 'energy, authority, new beginnings' },
  Moon:    { rashi: 'Mithun',   effect: 'communication, mental activity' },
  Mars:    { rashi: 'Mithun',   effect: 'aggression in communication' },
  Mercury: { rashi: 'Mesh',     effect: 'quick decisions, business' },
  Jupiter: { rashi: 'Vrishabh', effect: 'wealth, family, slow expansion' },
  Venus:   { rashi: 'Meen',     effect: 'EXALTED — peak love, creativity, luxury' },
  Saturn:  { rashi: 'Kumbh',    effect: 'karma, discipline, technology' },
  Rahu:    { rashi: 'Meen',     effect: 'illusions, spiritual confusion' },
  Ketu:    { rashi: 'Kanya',    effect: 'detachment, health, past karma' },
};

export type PersonalizedPredictionProps = {
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
  // Dual chart
  partnerName?: string;
  partnerDob?: string;
  partnerLagna?: string;
  partnerMahadasha?: string;
  partnerNakshatra?: string;
  partnerPlanets?: Planet[];
  // Unlock
  isPaid?: boolean;
  onUnlockClick?: () => void;
};

// ─── LAYER 2: GOCHAR IMPACT ───────────────────────────────────────────────────
function calcGocharImpact(natalPlanets: Planet[], lagna: string) {
  const RASHIS = [
    'Mesh','Vrishabh','Mithun','Kark','Simha','Kanya',
    'Tula','Vrischik','Dhanu','Makar','Kumbh','Meen',
  ];
  const lagnaIdx     = RASHIS.indexOf(lagna);
  const jupGocharIdx = RASHIS.indexOf('Vrishabh');
  const jupHouse     = lagnaIdx >= 0 ? ((jupGocharIdx - lagnaIdx + 12) % 12) + 1 : 2;

  const positive: string[] = [];
  const challenge: string[] = [];

  // Venus exalted — universal positive
  positive.push('Venus exalted in Meen — love, creativity, wealth at peak');

  // Jupiter transit impact
  if ([1,5,9,11].includes(jupHouse)) {
    positive.push(`Jupiter in your ${jupHouse}th house — luck and expansion active`);
  } else if ([6,8,12].includes(jupHouse)) {
    challenge.push(`Jupiter in ${jupHouse}th — hidden growth, some turbulence`);
  }

  // Saturn check
  const natalSaturn = natalPlanets.find(p => p.name === 'Saturn');
  if (natalSaturn && natalSaturn.strength < 50) {
    challenge.push('Saturn in Kumbh — karmic lessons, patience needed');
  } else {
    positive.push('Saturn in Kumbh — structured discipline rewards');
  }

  // Rahu-Moon check
  const natalMoon = natalPlanets.find(p => p.name === 'Moon');
  if (natalMoon?.rashi === 'Meen' || natalMoon?.rashi === 'Kanya') {
    challenge.push('Rahu near natal Moon — intense mental energy');
  }

  const keySignal = positive.length >= challenge.length
    ? `Strong sky — ${positive[0]}`
    : `Mixed phase — ${challenge[0] ?? positive[0]}`;

  return { positive, challenge, keySignal };
}

// ─── LAYER 1: SUSPENSE HOOK (3 lines, FREE) ───────────────────────────────────
function buildSuspenseHook(
  name: string, lagna: string, mahadasha: string,
  antardasha: string, nakshatra: string, planets: Planet[],
  segment: string, lang: Lang,
  isDual: boolean, partnerName?: string
): string {
  const f  = name.split(' ')[0] ?? name;
  const pf = partnerName?.split(' ')[0] ?? 'unka';
  const goodDasha = ['Jupiter','Venus','Mercury','Moon'].includes(mahadasha);

  const T: Record<string, Record<Lang, string>> = {
    ex_back: {
      hinglish: `${f} ji, aapka ${nakshatra} Nakshatra aur aaj ka Venus uchcha transit — ek purana rishta ek baar phir knock kar sakta hai.\n${mahadasha}-${antardasha} combination 7th house par ek unique pressure bana raha hai.\nLekin ek date hai jo sab kuch decide karegi — woh sirf deep reading mein hai...`,
      hindi:    `${f} जी, आपका ${nakshatra} नक्षत्र और आज शुक्र उच्च — एक पुराना रिश्ता फिर दस्तक दे सकता है।\n${mahadasha}-${antardasha} संयोग 7वें भाव पर दबाव बना रहा है।\nलेकिन एक तारीख है जो सब तय करेगी — वह deep reading में है...`,
      english:  `${f}, your ${nakshatra} Nakshatra and today's exalted Venus — an old connection may knock again.\nThe ${mahadasha}-${antardasha} combination creates unique pressure on your 7th house.\nBut one specific date decides everything — it's only in the deep reading...`,
    },
    toxic_boss: {
      hinglish: isDual
        ? `${f} ji aur ${pf} — dono ke charts mein ek Sun-Saturn power struggle chal rahi hai.\nAaj ka Shani transit seedha workplace house ko dekh raha hai.\nKaun jeetega yeh cosmic battle? Answer deep reading mein hai...`
        : `${f} ji, aapke ${lagna} Lagna aur boss ki energy — ek invisible war chal raha hai.\nAaj ka Shani transit aapke career house par nazar rakh raha hai.\nEk specific turning point aa raha hai — woh date deep reading mein hai...`,
      hindi: isDual
        ? `${f} जी और ${pf} — दोनों charts में Sun-Saturn power struggle है।\nआज का शनि transit workplace house को देख रहा है।\nकौन जीतेगा? उत्तर deep reading में है...`
        : `${f} जी, आपके ${lagna} लग्न और boss की energy — एक invisible war है।\nआज का शनि transit career house पर है।\nएक turning point आ रहा है — वह तारीख deep reading में है...`,
      english: isDual
        ? `${f} and ${pf} — both charts show a Sun-Saturn power conflict.\nToday's Saturn transit directly watches your workplace house.\nWho wins this cosmic battle? Only the deep reading knows...`
        : `${f}, your ${lagna} Ascendant vs your boss's energy — an invisible war is active.\nToday's Saturn transit watches your career house closely.\nA turning point is near — that date is in your deep reading...`,
    },
    manifestation: {
      hinglish: `${f} ji, Venus abhi Meen mein uchcha hai aur aapka ${nakshatra} — yeh rare combination sirf kuch logo ko milta hai.\n${mahadasha} Mahadasha mein sankalp shakti 10 guna zyada hai — lekin ek specific window hai.\nWoh window kab khulti hai — deep reading mein pata chalega...`,
      hindi:    `${f} जी, शुक्र मीन में उच्च और आपका ${nakshatra} — यह combination दुर्लभ है।\n${mahadasha} महादशा में संकल्प शक्ति 10 गुना — लेकिन एक window है।\nवह window कब — deep reading में पता चलेगा...`,
      english:  `${f}, Venus exalted in Pisces and your ${nakshatra} — this rare combination belongs to very few.\nIn your ${mahadasha} Mahadasha, manifestation power is 10x — but there's a specific window.\nWhen that window opens — only the deep reading reveals...`,
    },
    dream_career: {
      hinglish: `${f} ji, Jupiter Vrishabh mein aur ${lagna} Lagna — ek unexpected career shift ki energy build ho rahi hai.\n${mahadasha}-${antardasha} mein ek bada faisla aane wala hai.\nKya yeh aapke favor mein hai? Jawab deep reading mein hai...`,
      hindi:    `${f} जी, Jupiter वृषभ में और ${lagna} लग्न — career shift की energy build हो रही है।\n${mahadasha}-${antardasha} में एक बड़ा फैसला आने वाला है।\nक्या यह आपके favor में है? Deep reading में जवाब है...`,
      english:  `${f}, Jupiter in Taurus and ${lagna} Ascendant — a career shift energy is building.\nThe ${mahadasha}-${antardasha} brings a major decision soon.\nIs it in your favor? The deep reading has the answer...`,
    },
    property_yog: {
      hinglish: `${f} ji, Jupiter Vrishabh mein 4th house activate kar raha hai — property yog present hai.\nAaj Venus uchcha — documents aur agreements ke liye signal strong hai.\nLekin sahi muhurat ka pata hona zaroori hai — woh deep reading mein hai...`,
      hindi:    `${f} जी, Jupiter वृषभ में 4th house activate — property yog present है।\nआज Venus उच्च — documents के लिए signal strong है।\nसही मुहूर्त deep reading में है...`,
      english:  `${f}, Jupiter activating your 4th house — a property yoga is present.\nToday's exalted Venus signals strength for documents and agreements.\nBut the exact muhurta is in your deep reading...`,
    },
    retirement_peace: {
      hinglish: `${f} ji, ${nakshatra} Nakshatra aur ${mahadasha} Mahadasha — ek deep spiritual turning point aa raha hai.\nAaj Saturn Kumbh mein moksha bhava ko dekh raha hai — peace ka raasta khul raha hai.\nKab aur kaise — woh timeline deep reading mein hai...`,
      hindi:    `${f} जी, ${nakshatra} और ${mahadasha} — एक spiritual turning point आ रहा है।\nआज शनि मोक्ष भाव पर — peace का रास्ता खुल रहा है।\nकब और कैसे — deep reading में है...`,
      english:  `${f}, your ${nakshatra} and ${mahadasha} — a deep spiritual turning point approaches.\nSaturn today watches your moksha house — the peace path opens.\nWhen and how — that timeline is in your deep reading...`,
    },
    default: {
      hinglish: `${f} ji, aapka ${lagna} Lagna aur aaj ka cosmic sky — ek important life window abhi khuli hui hai.\n${mahadasha}-${antardasha} combination ek aise phase mein hai jo sirf kuch saal mein aata hai.\nIs window ka poora faayda kaise uthayein — deep reading mein specific action plan hai...`,
      hindi:    `${f} जी, ${lagna} लग्न और आज का cosmic sky — एक life window खुली है।\n${mahadasha}-${antardasha} ऐसे phase में है जो सालों में आता है।\nइसका पूरा फायदा कैसे — deep reading में है...`,
      english:  `${f}, your ${lagna} Ascendant and today's cosmic sky — an important life window is open.\nThe ${mahadasha}-${antardasha} is in a phase that comes once in years.\nHow to fully use it — a specific action plan awaits in your deep reading...`,
    },
  };

  const seg = T[segment] ?? T['default']!;
  return seg[lang] ?? seg['hinglish'];
}

// ─── LAYER 3: GEMINI PROMPT ───────────────────────────────────────────────────
function buildDeepPrompt(
  name: string, lagna: string, mahadasha: string,
  antardasha: string, nakshatra: string, planets: Planet[],
  segment: string, segmentLabel: string, lang: Lang,
  gochar: ReturnType<typeof calcGocharImpact>,
  isDual: boolean,
  partnerName?: string, partnerLagna?: string,
  partnerMahadasha?: string, partnerNakshatra?: string,
  partnerPlanets?: Planet[]
): string {
  const langRule =
    lang === 'hindi'   ? 'Pure conversational Hindi (Devanagari). Simple words, no Sanskrit jargon.' :
    lang === 'english' ? 'Clear warm English. Direct and personal.' :
                         'Hinglish — natural Hindi-English mix like educated Indians speak.';

  const planetStr = planets
    .map(p => `${p.name}: ${p.rashi} H${p.house}, ${p.nakshatra} ${p.degree}°, str=${p.strength}%${p.isRetrograde ? ' RETRO' : ''}`)
    .join('\n');

  const gocharStr = Object.entries(CURRENT_GOCHAR)
    .map(([k,v]) => `${k}: ${v.rashi} — ${v.effect}`)
    .join('\n');

  const partnerStr = isDual && partnerName ? `
SECOND PERSON:
Name: ${partnerName} | Lagna: ${partnerLagna} | Mahadasha: ${partnerMahadasha} | Nakshatra: ${partnerNakshatra}
Planets: ${partnerPlanets?.map(p=>`${p.name}:${p.rashi}H${p.house}str${p.strength}`).join(', ') ?? 'N/A'}
` : '';

  const dualRule = isDual ? `
DUAL ANALYSIS: Compare both charts for "${segmentLabel}". You MUST output:
RED_FLAG_SCORE: [0-10]
GREEN_FLAG_SCORE: [0-10]
FLAG_SUMMARY: [1 crisp line]
` : '';

  return `You are Jini — AI soul of Trikal Vaani by Rohiit Gupta ji. You are a wise, warm Vedic Guru.

NATAL CHART:
Name: ${name} | Lagna: ${lagna} | Mahadasha: ${mahadasha} | Antardasha: ${antardasha} | Nakshatra: ${nakshatra}
${planetStr}
${partnerStr}
TODAY'S GOCHAR (April 2026):
${gocharStr}

GOCHAR IMPACTS: Positive: ${gochar.positive.join(' | ')} | Challenges: ${gochar.challenge.join(' | ')}
${dualRule}
LIFE QUESTION: "${segmentLabel || segment}"

OUTPUT FORMAT (use these exact labels, plain text only, no asterisks):
${isDual ? `RED_FLAG_SCORE: [number]
GREEN_FLAG_SCORE: [number]
FLAG_SUMMARY: [one line]
` : ''}MAIN_PREDICTION:
[120-150 words. Reference minimum 3 natal planets + 2 gochar transits. Include "Rohiit Gupta ji ka Trikal framework kehta hai" naturally. Personal, specific, no generic astrology.]

KEY_DATES:
[2-3 specific upcoming dates/timeframes based on dasha + gochar. Format: Month YYYY — reason]

ACTION_ADVICE:
[2-3 concrete actions to take RIGHT NOW based on this chart + sky]

CLOSING_HOOK:
[1 powerful mysterious yet hopeful line]

LANGUAGE: ${langRule}
IMPORTANT: Every claim must trace to a specific planet or transit. Speak directly to ${name.split(' ')[0]}.`;
}

// ─── PARSER ───────────────────────────────────────────────────────────────────
function parseDeep(raw: string, isDual: boolean) {
  const get = (key: string) => {
    const m = raw.match(new RegExp(`${key}:\\s*([\\s\\S]*?)(?=\\n[A-Z_]+:|$)`, 'i'));
    return m?.[1]?.trim() ?? '';
  };
  return {
    redFlagScore:   isDual ? parseInt(get('RED_FLAG_SCORE') || '0', 10) : 0,
    greenFlagScore: isDual ? parseInt(get('GREEN_FLAG_SCORE') || '0', 10) : 0,
    flagSummary:    get('FLAG_SUMMARY'),
    mainPrediction: get('MAIN_PREDICTION'),
    keyDates:       get('KEY_DATES'),
    actionAdvice:   get('ACTION_ADVICE'),
    closingHook:    get('CLOSING_HOOK'),
  };
}

// ─── SCORE METER ──────────────────────────────────────────────────────────────
function ScoreMeter({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: 'rgba(148,163,184,0.7)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{score}/10</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{
          width: `${score * 10}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}70, ${color})`,
          borderRadius: 3, transition: 'width 1.2s ease',
        }} />
      </div>
    </div>
  );
}

const LANG_META: Record<Lang, { label: string; flag: string }> = {
  hindi:    { label: 'हिंदी',    flag: '🇮🇳' },
  hinglish: { label: 'Hinglish', flag: '✨' },
  english:  { label: 'English',  flag: '🌐' },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PersonalizedPrediction({
  name, lagna, mahadasha, antardasha, nakshatra,
  planets, dob,
  autoSegment = 'default', autoSegmentLabel = '',
  lang = 'hinglish',
  partnerName, partnerDob, partnerLagna,
  partnerMahadasha, partnerNakshatra, partnerPlanets,
  isPaid = false, onUnlockClick,
}: PersonalizedPredictionProps) {

  const isDual = !!(partnerName?.trim());

  const [hook, setHook]               = useState('');
  const [gochar, setGochar]           = useState<ReturnType<typeof calcGocharImpact> | null>(null);
  const [deep, setDeep]               = useState<ReturnType<typeof parseDeep> | null>(null);
  const [loading, setLoading]         = useState(false);
  const [preparing, setPreparing]     = useState(false);
  const [countdown, setCountdown]     = useState(120);
  const [visible, setVisible]         = useState(false);
  const fetched = useRef(false);

  // Layer 1 + 2 — instant
  useEffect(() => {
    const t = setTimeout(() => {
      const g = calcGocharImpact(planets, lagna);
      setGochar(g);
      setHook(buildSuspenseHook(
        name, lagna, mahadasha, antardasha,
        nakshatra, planets, autoSegment, lang,
        isDual, partnerName
      ));
      setVisible(true);
    }, 400);
    return () => clearTimeout(t);
  }, [name, lagna, mahadasha, antardasha, nakshatra, planets, autoSegment, lang, isDual, partnerName]);

  // Layer 3 — Gemini (paid only)
  useEffect(() => {
    if (!isPaid || !hook || fetched.current || !gochar) return;
    fetched.current = true;
    setPreparing(true);
    setLoading(true);

    const cd = setInterval(() => setCountdown(p => p > 1 ? p - 1 : 0), 1000);

    fetch('/api/jini-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: buildDeepPrompt(
          name, lagna, mahadasha, antardasha, nakshatra,
          planets, autoSegment, autoSegmentLabel, lang, gochar,
          isDual, partnerName, partnerLagna,
          partnerMahadasha, partnerNakshatra, partnerPlanets
        ),
        mode: 'deep_prediction',
        chartData: { lagna, mahadasha, antardasha, nakshatra, planets },
      }),
    })
      .then(r => r.json())
      .then(d => {
        const reply = d.reply ?? d.message ?? d.text ?? '';
        if (reply?.length > 50) setDeep(parseDeep(reply, isDual));
      })
      .catch(e => console.error('[Trikal] Gemini error:', e))
      .finally(() => {
        clearInterval(cd);
        setLoading(false);
        setPreparing(false);
        setCountdown(0);
      });

    return () => clearInterval(cd);
  }, [isPaid, hook, gochar]);

  const lm       = LANG_META[lang];
  const segLabel = autoSegmentLabel || 'Cosmic Reading';
  const fn       = name.split(' ')[0] ?? name;

  const cardStyle = {
    background:   'linear-gradient(135deg, rgba(15,5,40,0.97), rgba(6,12,28,0.99))',
    border:       `1px solid ${GOLD_RGBA(0.2)}`,
    borderRadius: 18,
    padding:      '22px 24px',
    marginBottom: 10,
    position:     'relative' as const,
    overflow:     'hidden' as const,
  };

  const shimmer = (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 1,
      background: `linear-gradient(90deg, transparent, ${GOLD_RGBA(0.6)}, transparent)`,
    }} />
  );

  const jiniHeader = (subtitle: string, badge: React.ReactNode) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: `linear-gradient(135deg, ${GOLD_RGBA(0.2)}, ${PURPLE_RGBA(0.2)})`,
          border: `1.5px solid ${GOLD_RGBA(0.4)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17,
        }}>🔮</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>Jini — Trikal Vaani</div>
          <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)', marginTop: 1 }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 5 }}>
        <div style={{
          padding: '3px 8px', background: GOLD_RGBA(0.08),
          border: `1px solid ${GOLD_RGBA(0.2)}`, borderRadius: 20,
          fontSize: 10, color: GOLD, fontWeight: 600,
        }}>
          {lm.flag} {lm.label}
        </div>
        {badge}
      </div>
    </div>
  );

  // ── PREPARING STATE ──────────────────────────────────────────────────────────
  if (isPaid && preparing) {
    return (
      <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s' }}>
        <div style={{ ...cardStyle, textAlign: 'center', padding: '36px 24px' }}>
          {shimmer}
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: `radial-gradient(circle, ${GOLD_RGBA(0.3)}, ${PURPLE_RGBA(0.2)})`,
            border: `2px solid ${GOLD_RGBA(0.4)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 20px',
            boxShadow: `0 0 40px ${GOLD_RGBA(0.25)}`,
            animation: 'orb-pulse 2s infinite',
          }}>🔮</div>

          <p style={{ fontSize: 18, fontWeight: 700, color: GOLD, marginBottom: 8 }}>
            {lang === 'hindi' ? 'जिनी आपकी deep reading तैयार कर रही है...'
             : lang === 'english' ? 'Jini is preparing your deep reading...'
             : 'Jini aapki deep reading taiyaar kar rahi hai...'}
          </p>
          <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.55)', marginBottom: 24 }}>
            {lang === 'hindi' ? 'ग्रह स्थिति + आज का आकाश + AI विश्लेषण'
             : lang === 'english' ? 'Natal chart + Today\'s sky + AI synthesis'
             : 'Natal chart + Aaj ka sky + AI synthesis'}
          </p>

          {/* Countdown pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 22px',
            background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}`, borderRadius: 30,
            marginBottom: 24,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: GREEN, boxShadow: `0 0 8px ${GREEN}`, animation: 'blink 1s infinite',
            }} />
            <span style={{ fontSize: 13, color: GOLD, fontWeight: 600 }}>
              {countdown > 0 ? `~${Math.ceil(countdown / 60)}m ${countdown % 60}s` : (lang === 'english' ? 'Almost ready...' : 'Almost ready...')}
            </span>
          </div>

          {/* Progress steps */}
          <div style={{ textAlign: 'left', maxWidth: 280, margin: '0 auto' }}>
            {[
              { done: true,  text: lang === 'hindi' ? '✓ जन्म कुंडली विश्लेषण' : '✓ Natal chart analyzed' },
              { done: true,  text: lang === 'hindi' ? '✓ आज का Gochar check' : '✓ Today\'s Gochar checked' },
              { done: false, text: isDual
                ? (lang === 'hindi' ? '⟳ दोनों कुंडलियों की तुलना...' : '⟳ Comparing both charts...')
                : (lang === 'hindi' ? '⟳ Deep prediction generate हो रही है...' : '⟳ Generating deep prediction...') },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 0', fontSize: 12,
                color: s.done ? GREEN : GOLD,
              }}>{s.text}</div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes orb-pulse { 0%,100%{box-shadow:0 0 40px ${GOLD_RGBA(0.25)}} 50%{box-shadow:0 0 60px ${GOLD_RGBA(0.5)}} }
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        `}</style>
      </div>
    );
  }

  // ── DEEP READING (paid + loaded) ──────────────────────────────────────────
  if (isPaid && deep) {
    return (
      <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.7s ease' }}>

        {/* Dual chart scores */}
        {isDual && (
          <div style={{
            background: 'rgba(6,12,28,0.99)',
            border: `1px solid rgba(255,255,255,0.1)`,
            borderRadius: 16, padding: '20px 22px', marginBottom: 10,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const,
              letterSpacing: '0.06em', color: 'rgba(148,163,184,0.5)', marginBottom: 14,
            }}>
              🎯 {fn} × {partnerName?.split(' ')[0]} — Compatibility Analysis
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              <ScoreMeter score={deep.greenFlagScore} label={lang === 'hindi' ? '🟢 हरे झंडे' : '🟢 Green Flags'} color={GREEN} />
              <ScoreMeter score={deep.redFlagScore}   label={lang === 'hindi' ? '🔴 लाल झंडे' : '🔴 Red Flags'}   color={RED} />
            </div>
            {deep.flagSummary && (
              <div style={{
                padding: '10px 14px', borderRadius: 10, fontSize: 12, lineHeight: 1.65,
                background: deep.redFlagScore > deep.greenFlagScore ? RED_RGBA(0.08) : GREEN_RGBA(0.08),
                border: `1px solid ${deep.redFlagScore > deep.greenFlagScore ? RED_RGBA(0.25) : GREEN_RGBA(0.25)}`,
                color: deep.redFlagScore > deep.greenFlagScore ? '#FCA5A5' : '#86EFAC',
              }}>
                {deep.flagSummary}
              </div>
            )}
          </div>
        )}

        {/* Main deep reading card */}
        <div style={cardStyle}>
          {shimmer}
          {jiniHeader(
            `${segLabel} · 3-Layer Trikal Analysis`,
            <div style={{
              padding: '3px 9px', background: PURPLE_RGBA(0.12),
              border: `1px solid ${PURPLE_RGBA(0.3)}`, borderRadius: 20,
              fontSize: 10, color: '#C4B5FD', fontWeight: 600,
            }}>✨ AI Deep</div>
          )}

          {deep.mainPrediction && (
            <div style={{ fontSize: 14, lineHeight: 1.85, color: 'rgba(226,232,240,0.92)', marginBottom: 18 }}>
              {deep.mainPrediction}
            </div>
          )}

          {deep.keyDates && (
            <div style={{
              padding: '14px 16px', background: GOLD_RGBA(0.06),
              border: `1px solid ${GOLD_RGBA(0.15)}`, borderRadius: 12, marginBottom: 12,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: GOLD_RGBA(0.6), marginBottom: 8 }}>
                📅 {lang === 'hindi' ? 'महत्वपूर्ण तारीखें' : 'Key Dates'}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(226,232,240,0.85)', lineHeight: 1.75, whiteSpace: 'pre-line' as const }}>
                {deep.keyDates}
              </div>
            </div>
          )}

          {deep.actionAdvice && (
            <div style={{
              padding: '14px 16px', background: GREEN_RGBA(0.06),
              border: `1px solid ${GREEN_RGBA(0.15)}`, borderRadius: 12, marginBottom: 16,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: GREEN_RGBA(0.7), marginBottom: 8 }}>
                ⚡ {lang === 'hindi' ? 'अभी क्या करें' : lang === 'english' ? 'Action Now' : 'Abhi Kya Karein'}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(226,232,240,0.85)', lineHeight: 1.75, whiteSpace: 'pre-line' as const }}>
                {deep.actionAdvice}
              </div>
            </div>
          )}

          {deep.closingHook && (
            <div style={{
              borderTop: `1px solid ${GOLD_RGBA(0.08)}`, paddingTop: 14,
              fontSize: 13, color: GOLD_RGBA(0.75),
              fontWeight: 500, fontStyle: 'italic', lineHeight: 1.65,
            }}>
              🌟 {deep.closingHook}
            </div>
          )}
        </div>

        {/* Gochar note */}
        {gochar && (
          <div style={{
            padding: '9px 14px', background: 'rgba(6,12,28,0.8)',
            border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 10, marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 13 }}>🌌</span>
            <span style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)' }}>
              {lang === 'english' ? `Today's sky: ${gochar.keySignal}` : `Aaj ka sky: ${gochar.keySignal}`}
            </span>
          </div>
        )}

        {/* Tagline */}
        <div style={{
          textAlign: 'center', padding: '10px 16px',
          background: GOLD_RGBA(0.03), border: `1px solid ${GOLD_RGBA(0.08)}`, borderRadius: 10,
        }}>
          <p style={{ fontSize: 11, color: GOLD_RGBA(0.45), fontStyle: 'italic' }}>
            {lang === 'hindi' ? '"काल बड़ा बलवान है — और आपका काल, आपकी कुंडली में लिखा है"'
             : lang === 'english' ? '"Time is the greatest force — and your time is written in your Kundali"'
             : '"Kaal bada balwan hai — aur aapka Kaal, aapki Kundali mein likha hai"'}
          </p>
          <p style={{ fontSize: 10, color: 'rgba(100,116,139,0.5)', marginTop: 3 }}>
            Rohiit Gupta · Chief Vedic Architect · Trikal Vaani
          </p>
        </div>
      </div>
    );
  }

  // ── FREE SUSPENSE HOOK ────────────────────────────────────────────────────
  return (
    <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
      <div style={cardStyle}>
        {shimmer}

        {jiniHeader(
          `${segLabel} · ${lagna} Lagna · ${mahadasha} Dasha`,
          <div style={{
            padding: '3px 8px', background: GREEN_RGBA(0.08),
            border: `1px solid ${GREEN_RGBA(0.2)}`, borderRadius: 20,
            fontSize: 10, color: GREEN, fontWeight: 600,
          }}>Free</div>
        )}

        {/* 3-line suspense hook */}
        <div style={{ fontSize: 14, lineHeight: 2, color: 'rgba(226,232,240,0.92)', marginBottom: 16 }}>
          {hook ? hook.split('\n').map((line, i) => (
            <p key={i} style={{ margin: 0, marginBottom: i < 2 ? 2 : 0 }}>{line}</p>
          )) : (
            <span style={{ color: 'rgba(148,163,184,0.35)', fontStyle: 'italic' }}>
              {lang === 'hindi' ? 'कुंडली पढ़ी जा रही है...' : lang === 'english' ? 'Reading your blueprint...' : 'Blueprint pad raha hai...'}
            </span>
          )}
        </div>

        {/* Gochar teaser */}
        {gochar && (
          <div style={{
            padding: '8px 12px', background: GOLD_RGBA(0.05),
            border: `1px solid ${GOLD_RGBA(0.12)}`, borderRadius: 8, marginBottom: 16,
            fontSize: 11, color: GOLD_RGBA(0.6),
          }}>
            🌌 {lang === 'english' ? `Sky signal: ${gochar.positive[0] ?? gochar.keySignal}` : `Aaj ka sky signal: ${gochar.positive[0] ?? gochar.keySignal}`}
          </div>
        )}

        {/* Blurred deep content teaser */}
        <div style={{
          padding: '14px 16px', background: 'rgba(0,0,0,0.45)',
          border: `1px solid rgba(255,255,255,0.05)`, borderRadius: 12,
          marginBottom: 16, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ filter: 'blur(5px)', userSelect: 'none', fontSize: 13, color: 'rgba(226,232,240,0.6)', lineHeight: 1.75 }}>
            {lang === 'hindi'
              ? 'आपके Jupiter और Venus की स्थिति एक बड़े बदलाव का संकेत दे रही है। Key date: जून 2026 — एक decision जो दिशा बदल देगा...'
              : lang === 'english'
              ? 'Your Jupiter and Venus positions signal a major shift ahead. Key date: June 2026 — one decision that changes direction...'
              : 'Aapke Jupiter aur Venus ki position ek bade badlaav ka signal de rahi hai. Key date: June 2026 — ek decision jo disha badal dega...'}
          </div>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(6,12,28,0.65)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🔒</div>
              <div style={{ fontSize: 11, color: GOLD_RGBA(0.7), fontWeight: 600 }}>
                {lang === 'hindi' ? 'Deep Reading में unlock होगा' : lang === 'english' ? 'Unlocks in Deep Reading' : 'Deep Reading mein unlock hoga'}
              </div>
            </div>
          </div>
        </div>

        {/* Unlock CTA */}
        <button
          onClick={onUnlockClick}
          style={{
            width: '100%', padding: '14px 20px',
            background: `linear-gradient(135deg, ${GOLD} 0%, #A8862A 100%)`,
            border: 'none', borderRadius: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            boxShadow: `0 0 28px ${GOLD_RGBA(0.35)}`,
          }}
        >
          <span style={{ fontSize: 18 }}>✨</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#080B12' }}>
              {lang === 'hindi' ? 'Deep Reading Unlock करें — ₹51 only'
               : lang === 'english' ? 'Unlock Deep Reading — ₹51 only'
               : 'Deep Reading Unlock Karein — ₹51 only'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(8,11,18,0.6)', marginTop: 1 }}>
              Key dates · Action plan · Gochar analysis · AI prediction
            </div>
          </div>
          <span style={{ fontSize: 18, marginLeft: 'auto' }}>→</span>
        </button>
      </div>

      {/* Tagline */}
      <div style={{
        textAlign: 'center', padding: '10px 16px',
        background: GOLD_RGBA(0.03), border: `1px solid ${GOLD_RGBA(0.08)}`, borderRadius: 10,
      }}>
        <p style={{ fontSize: 11, color: GOLD_RGBA(0.45), fontStyle: 'italic' }}>
          {lang === 'hindi' ? '"काल बड़ा बलवान है — और आपका काल, आपकी कुंडली में लिखा है"'
           : lang === 'english' ? '"Time is the greatest force — and your time is written in your Kundali"'
           : '"Kaal bada balwan hai — aur aapka Kaal, aapki Kundali mein likha hai"'}
        </p>
        <p style={{ fontSize: 10, color: 'rgba(100,116,139,0.5)', marginTop: 3 }}>
          Rohiit Gupta · Chief Vedic Architect · Trikal Vaani
        </p>
      </div>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}`}</style>
    </div>
  );
}
