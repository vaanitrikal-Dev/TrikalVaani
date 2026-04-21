/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 1.0 (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: PERSONALIZED PREDICTION BLOCK — SHOWN BELOW 3-MONTH SUMMARY HEADER
 * FLOW: Rule-based prediction fires INSTANTLY → Gemini deepens it in background
 * LANGUAGE: Reads `lang` param (hindi / hinglish / english) from URL
 * POSITION: Yellow arrow area — between 3-Month header and Energy Meter
 */

'use client';

import { useEffect, useState, useRef } from 'react';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;
const PURPLE = '#7C3AED';
const PURPLE_RGBA = (a: number) => `rgba(124,58,237,${a})`;

// ─── TYPES ────────────────────────────────────────────────────────────────────
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

export type PersonalizedPredictionProps = {
  name: string;
  lagna: string;
  mahadasha: string;
  antardasha: string;
  nakshatra: string;
  planets: Planet[];
  autoSegment?: string;
  autoSegmentLabel?: string;
  lang?: Lang;
};

// ─── INSTANT RULE-BASED ENGINE ────────────────────────────────────────────────
// Fires immediately — no API call — pure Parashara logic
// Returns short 2-line hook in correct language

function buildInstantPrediction(
  name: string,
  lagna: string,
  mahadasha: string,
  antardasha: string,
  nakshatra: string,
  planets: Planet[],
  segment: string,
  lang: Lang
): string {
  const firstName = name.split(' ')[0] ?? name;
  const jupiter   = planets.find(p => p.name === 'Jupiter');
  const venus     = planets.find(p => p.name === 'Venus');
  const saturn    = planets.find(p => p.name === 'Saturn');
  const sun       = planets.find(p => p.name === 'Sun');
  const moon      = planets.find(p => p.name === 'Moon');
  const rahu      = planets.find(p => p.name === 'Rahu');

  const goodDashas      = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  const challengeDashas = ['Saturn', 'Rahu', 'Ketu'];
  const dashaQuality    = goodDashas.includes(mahadasha)
    ? 'good' : challengeDashas.includes(mahadasha) ? 'challenge' : 'neutral';

  // ── HINDI ──────────────────────────────────────────────────────────────────
  const hindi: Record<string, string> = {
    ex_back: dashaQuality === 'good'
      ? `${firstName} जी, आपका ${nakshatra} नक्षत्र और ${mahadasha} महादशा — एक पुराना रिश्ता वापस आने के संकेत दे रहा है। ${antardasha} अंतर्दशा में एक महत्वपूर्ण मोड़ आने वाला है।`
      : `${firstName} जी, ${mahadasha} महादशा एक कार्मिक परीक्षा का समय है। आपके सातवें भाव में जो लिखा है — वह आपकी पूरी पढ़ाई में सामने आएगा।`,
    toxic_boss: saturn && saturn.strength < 50
      ? `${firstName} जी, शनि की वर्तमान स्थिति कार्यस्थल पर दबाव का संकेत दे रही है। ${mahadasha} महादशा में एक निर्णायक बदलाव आने वाला है।`
      : `${firstName} जी, ${lagna} लग्न के साथ ${mahadasha} महादशा — आपके पास एक विशेष सुरक्षा कवच है। बॉस का व्यवहार अस्थायी है।`,
    manifestation: jupiter && jupiter.strength > 65
      ? `${firstName} जी, गुरु आपके चार्ट में बलवान हैं — यह एक दुर्लभ संयोग है। ${mahadasha} महादशा में आपकी इच्छाशक्ति चरम पर है।`
      : `${firstName} जी, ${nakshatra} नक्षत्र एक गहरी आध्यात्मिक ऊर्जा लेकर आता है। अभी जो संकल्प लें — उसकी शक्ति दस गुना अधिक है।`,
    dream_career: sun && sun.house === 10
      ? `${firstName} जी, सूर्य दसवें भाव में — करियर की नियति प्रबल है। ${mahadasha} महादशा में एक बड़ा अवसर खुल रहा है।`
      : `${firstName} जी, ${lagna} लग्न के जातक ${mahadasha} महादशा में अप्रत्याशित करियर बदलाव देखते हैं — यह आपके लिए शुभ है।`,
    property_yog: jupiter && jupiter.house === 4
      ? `${firstName} जी, गुरु चतुर्थ भाव में — यह एक दुर्लभ संपत्ति योग है। अगले छह महीने में एक विशेष खिड़की खुल रही है।`
      : `${firstName} जी, ${mahadasha}-${antardasha} संयोग संपत्ति के लिए एक महत्वपूर्ण समय है। सही मुहूर्त जानना आवश्यक है।`,
    retirement_peace: `${firstName} जी, ${nakshatra} नक्षत्र आध्यात्मिक यात्रा के लिए अत्यंत शक्तिशाली है। ${mahadasha} महादशा जीवन समीक्षा का समय है — शांति का मार्ग खुल रहा है।`,
    default: `${firstName} जी, आपका ${lagna} लग्न और ${nakshatra} नक्षत्र एक अनूठा ब्रह्मांडीय खाका बनाता है। ${mahadasha} महादशा में एक महत्वपूर्ण जीवन खिड़की खुल रही है।`,
  };

  // ── ENGLISH ────────────────────────────────────────────────────────────────
  const english: Record<string, string> = {
    ex_back: dashaQuality === 'good'
      ? `${firstName}, your ${nakshatra} Nakshatra and ${mahadasha} Mahadasha are sending strong signals of reconnection. The ${antardasha} sub-period holds a decisive turning point in relationships.`
      : `${firstName}, your ${mahadasha} Mahadasha is a period of karmic review. What's written in your 7th house will be revealed in your complete reading.`,
    toxic_boss: saturn && saturn.strength < 50
      ? `${firstName}, Saturn's current position indicates real workplace pressure. A decisive shift is approaching in your ${mahadasha} Mahadasha.`
      : `${firstName}, your ${lagna} Ascendant combined with ${mahadasha} Mahadasha gives you a powerful protective shield. Your boss's behavior is temporary.`,
    manifestation: jupiter && jupiter.strength > 65
      ? `${firstName}, Jupiter is strong in your chart — a rare combination. Your manifestation power is at its peak during this ${mahadasha} Mahadasha.`
      : `${firstName}, ${nakshatra} Nakshatra carries deep spiritual energy. Any intention set right now carries 10x the power. The right timing is everything.`,
    dream_career: sun && sun.house === 10
      ? `${firstName}, Sun in the 10th house — your career destiny is powerful. A major opportunity window is opening in your ${mahadasha} Mahadasha.`
      : `${firstName}, people with ${lagna} Ascendant experience unexpected career shifts in ${mahadasha} Mahadasha — and this shift is in your favor.`,
    property_yog: jupiter && jupiter.house === 4
      ? `${firstName}, Jupiter in the 4th house — this is a rare property yoga. A specific window opens in the next 6 months for maximum gains.`
      : `${firstName}, the ${mahadasha}-${antardasha} combination is a critical period for real estate decisions. The right muhurta is key.`,
    retirement_peace: `${firstName}, the ${nakshatra} Nakshatra is extremely powerful for spiritual journeys. Your ${mahadasha} Mahadasha is a time for life review — the path to peace is opening.`,
    default: `${firstName}, your ${lagna} Ascendant and ${nakshatra} Nakshatra create a unique cosmic blueprint. An important life window is opening in your ${mahadasha} Mahadasha.`,
  };

  // ── HINGLISH ───────────────────────────────────────────────────────────────
  const hinglish: Record<string, string> = {
    ex_back: dashaQuality === 'good'
      ? `${firstName} ji, aapka ${nakshatra} Nakshatra aur ${mahadasha} Mahadasha — ek purana rishta wapas aane ke strong signals de raha hai. ${antardasha} Antardasha mein ek turning point aane wala hai.`
      : `${firstName} ji, ${mahadasha} Mahadasha ek karmic review ka waqt hai. Aapke 7th house mein jo likha hai — woh poori reading mein saamne aayega.`,
    toxic_boss: saturn && saturn.strength < 50
      ? `${firstName} ji, Saturn ki current position workplace pressure ka signal de rahi hai. ${mahadasha} Mahadasha mein ek decisive shift aane wali hai.`
      : `${firstName} ji, aapka ${lagna} Lagna aur ${mahadasha} Mahadasha — ek powerful protection cover hai. Boss ka behavior temporary hai.`,
    manifestation: jupiter && jupiter.strength > 65
      ? `${firstName} ji, Jupiter aapke chart mein balwaan hai — yeh ek rare combination hai. ${mahadasha} Mahadasha mein aapki manifestation power peak par hai.`
      : `${firstName} ji, ${nakshatra} Nakshatra ek deep spiritual energy leta aata hai. Abhi jo sankalp lo — uski shakti 10 guna zyada hai.`,
    dream_career: sun && sun.house === 10
      ? `${firstName} ji, Sun 10th house mein — career destiny strong hai. ${mahadasha} Mahadasha mein ek bada opportunity window khul raha hai.`
      : `${firstName} ji, ${lagna} Lagna ke log ${mahadasha} Mahadasha mein unexpected career shifts dekhte hain — aur yeh shift aapke liye positive hai.`,
    property_yog: jupiter && jupiter.house === 4
      ? `${firstName} ji, Jupiter 4th house mein — yeh ek rare property yog hai. Agle 6 mahine mein ek specific window khul rahi hai maximum gains ke liye.`
      : `${firstName} ji, ${mahadasha}-${antardasha} combination real estate decisions ke liye ek critical phase hai. Sahi muhurat jaanna zaroori hai.`,
    retirement_peace: `${firstName} ji, ${nakshatra} Nakshatra spiritual journey ke liye bahut powerful hai. ${mahadasha} Mahadasha ek life review ka waqt hai — peace ka raasta khul raha hai.`,
    default: `${firstName} ji, aapka ${lagna} Lagna aur ${nakshatra} Nakshatra ek unique cosmic blueprint banata hai. ${mahadasha} Mahadasha mein ek important life window khul rahi hai.`,
  };

  const map = lang === 'hindi' ? hindi : lang === 'english' ? english : hinglish;
  return map[segment] ?? map['default']!;
}

// ─── GEMINI PROMPT BUILDER ────────────────────────────────────────────────────
function buildGeminiPrompt(
  name: string,
  lagna: string,
  mahadasha: string,
  antardasha: string,
  nakshatra: string,
  planets: Planet[],
  segment: string,
  segmentLabel: string,
  lang: Lang
): string {
  const planetSummary = planets
    .map(p => `${p.name}: ${p.rashi} House${p.house}, ${p.nakshatra}, strength=${p.strength}${p.isRetrograde ? ', retrograde' : ''}`)
    .join('\n');

  const langInstruction =
    lang === 'hindi'
      ? 'Respond in pure conversational Hindi (Devanagari script). Simple words only — no Sanskrit jargon.'
      : lang === 'english'
      ? 'Respond in clear, simple English. Warm and direct tone.'
      : 'Respond in Hinglish — natural mix of Hindi and English words. Like how educated Indians speak casually.';

  return `You are Jini, the AI soul of Trikal Vaani — a Vedic astrology platform by Rohiit Gupta.

BIRTH CHART DATA:
Name: ${name}
Lagna (Ascendant): ${lagna}
Current Mahadasha: ${mahadasha}
Current Antardasha: ${antardasha}  
Birth Nakshatra: ${nakshatra}
Life Question: ${segmentLabel || segment}

PLANET POSITIONS:
${planetSummary}

TASK:
Write a PERSONALIZED prediction for this person focused on their life question: "${segmentLabel || segment}".

STRICT RULES:
1. ${langInstruction}
2. Maximum 90 words — short, crisp, powerful
3. Reference AT LEAST 2 specific planets from their chart with their actual position
4. End with ONE suspense hook — hint at something important without revealing it fully
5. Always mention: "Rohiit Gupta ji ka Trikal framework kehta hai..." (or translate to chosen language)
6. Warm, personal tone — speak directly to ${name.split(' ')[0]}
7. NO generic astrology — must feel specific to THIS chart
8. Do NOT use markdown, asterisks, or formatting — plain text only

Write the prediction now:`;
}

// ─── TYPING ANIMATION ─────────────────────────────────────────────────────────
function useTypingEffect(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone]           = useState(false);

  useEffect(() => {
    if (!text) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayed, done };
}

// ─── LANGUAGE BADGE ───────────────────────────────────────────────────────────
const LANG_LABELS: Record<Lang, { label: string; flag: string }> = {
  hindi:    { label: 'हिंदी',    flag: '🇮🇳' },
  hinglish: { label: 'Hinglish', flag: '✨' },
  english:  { label: 'English',  flag: '🌐' },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PersonalizedPrediction({
  name, lagna, mahadasha, antardasha, nakshatra,
  planets, autoSegment = 'default', autoSegmentLabel = '',
  lang = 'hinglish',
}: PersonalizedPredictionProps) {

  const [instantText, setInstantText]   = useState('');
  const [geminiText, setGeminiText]     = useState('');
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiDone, setGeminiDone]     = useState(false);
  const [visible, setVisible]           = useState(false);
  const [showGemini, setShowGemini]     = useState(false);
  const hasFetched = useRef(false);

  const { displayed: typedGemini, done: typingDone } = useTypingEffect(
    showGemini ? geminiText : '', 14
  );

  // ── Step 1: Instant rule-based prediction (no API)
  useEffect(() => {
    const timer = setTimeout(() => {
      const text = buildInstantPrediction(
        name, lagna, mahadasha, antardasha,
        nakshatra, planets, autoSegment, lang
      );
      setInstantText(text);
      setVisible(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [name, lagna, mahadasha, antardasha, nakshatra, planets, autoSegment, lang]);

  // ── Step 2: Gemini deep prediction (fires after instant shown)
  useEffect(() => {
    if (!instantText || hasFetched.current) return;
    hasFetched.current = true;
    setGeminiLoading(true);

    const prompt = buildGeminiPrompt(
      name, lagna, mahadasha, antardasha,
      nakshatra, planets, autoSegment, autoSegmentLabel, lang
    );

    fetch('/api/jini-chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        message:    prompt,
        mode:       'prediction',
        chartData:  { lagna, mahadasha, antardasha, nakshatra, planets },
      }),
    })
      .then(res => res.json())
      .then(data => {
        const reply = data.reply ?? data.message ?? data.text ?? '';
        if (reply && reply.length > 20) {
          setGeminiText(reply);
          setGeminiDone(true);
          // Small delay before switching to Gemini text
          setTimeout(() => setShowGemini(true), 600);
        }
      })
      .catch(() => {
        // Gemini failed — instant prediction stays, no error shown
        setGeminiDone(false);
      })
      .finally(() => setGeminiLoading(false));
  }, [instantText]);

  const displayText = showGemini
    ? (typedGemini || instantText)
    : instantText;

  const isGeminiActive = showGemini && geminiText;
  const langMeta = LANG_LABELS[lang];
  const segLabel = autoSegmentLabel || 'Cosmic Reading';

  return (
    <div
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      {/* ── MAIN PREDICTION CARD ── */}
      <div style={{
        background:   'linear-gradient(135deg, rgba(15,5,40,0.97) 0%, rgba(6,12,28,0.99) 100%)',
        border:       `1px solid ${GOLD_RGBA(0.2)}`,
        borderRadius: 18,
        padding:      '22px 24px',
        marginBottom: 10,
        position:     'relative',
        overflow:     'hidden',
      }}>

        {/* Top gold shimmer line */}
        <div style={{
          position:   'absolute', top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${GOLD_RGBA(0.6)} 50%, transparent 100%)`,
        }} />

        {/* Subtle background glow */}
        <div style={{
          position:   'absolute', top: -40, right: -40,
          width:      180, height: 180,
          borderRadius: '50%',
          background: GOLD_RGBA(0.04),
          filter:     'blur(40px)',
          pointerEvents: 'none',
        }} />

        {/* ── HEADER ROW ── */}
        <div style={{
          display:       'flex',
          alignItems:    'center',
          justifyContent: 'space-between',
          marginBottom:  16,
        }}>
          {/* Left — Jini identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: `linear-gradient(135deg, ${GOLD_RGBA(0.2)}, ${PURPLE_RGBA(0.2)})`,
              border:     `1.5px solid ${GOLD_RGBA(0.4)}`,
              display:    'flex', alignItems: 'center', justifyContent: 'center',
              fontSize:   17, flexShrink: 0,
              boxShadow:  `0 0 12px ${GOLD_RGBA(0.15)}`,
            }}>
              🔮
            </div>
            <div>
              <div style={{
                fontSize: 13, fontWeight: 700,
                color: GOLD,
                letterSpacing: '0.01em',
              }}>
                Jini — Trikal Vaani
              </div>
              <div style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)', marginTop: 1 }}>
                {segLabel} · {lagna} Lagna · {mahadasha} Dasha
              </div>
            </div>
          </div>

          {/* Right — Status badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Language badge */}
            <div style={{
              display:      'flex',
              alignItems:   'center',
              gap:           4,
              padding:      '3px 8px',
              background:   GOLD_RGBA(0.08),
              border:       `1px solid ${GOLD_RGBA(0.2)}`,
              borderRadius:  20,
            }}>
              <span style={{ fontSize: 10 }}>{langMeta.flag}</span>
              <span style={{ fontSize: 10, color: GOLD, fontWeight: 600 }}>
                {langMeta.label}
              </span>
            </div>

            {/* AI / Instant badge */}
            <div style={{
              display:    'flex',
              alignItems: 'center',
              gap:         4,
              padding:    '3px 8px',
              background: isGeminiActive ? PURPLE_RGBA(0.12) : 'rgba(34,197,94,0.08)',
              border:     `1px solid ${isGeminiActive ? PURPLE_RGBA(0.3) : 'rgba(34,197,94,0.2)'}`,
              borderRadius: 20,
            }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: isGeminiActive ? '#A78BFA' : '#22C55E',
                boxShadow:  `0 0 5px ${isGeminiActive ? '#A78BFA' : '#22C55E'}`,
              }} />
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: isGeminiActive ? '#A78BFA' : '#22C55E',
              }}>
                {geminiLoading ? 'Jini thinking...' : isGeminiActive ? 'AI Deep Read' : 'Instant Read'}
              </span>
            </div>
          </div>
        </div>

        {/* ── PREDICTION TEXT ── */}
        <div style={{
          fontSize:     14,
          lineHeight:   1.85,
          color:        'rgba(226,232,240,0.92)',
          marginBottom: 18,
          minHeight:    72,
          position:     'relative',
        }}>
          {displayText || (
            <span style={{ color: 'rgba(148,163,184,0.4)', fontStyle: 'italic' }}>
              {lang === 'hindi' ? 'आपकी कुंडली पढ़ी जा रही है...'
               : lang === 'english' ? 'Reading your cosmic blueprint...'
               : 'Aapka cosmic blueprint pad raha hai...'}
            </span>
          )}
          {/* Typing cursor */}
          {showGemini && !typingDone && (
            <span style={{
              display:    'inline-block',
              width:       2, height: 14,
              background: GOLD,
              marginLeft:  2,
              verticalAlign: 'middle',
              animation:  'blink 0.8s infinite',
            }} />
          )}
        </div>

        {/* ── UPGRADE NOTICE — shows when Gemini kicks in ── */}
        {isGeminiActive && typingDone && (
          <div style={{
            padding:      '8px 12px',
            background:   PURPLE_RGBA(0.08),
            border:       `1px solid ${PURPLE_RGBA(0.2)}`,
            borderRadius:  8,
            marginBottom:  16,
            display:      'flex',
            alignItems:   'center',
            gap:           8,
          }}>
            <span style={{ fontSize: 12 }}>✨</span>
            <span style={{ fontSize: 11, color: '#C4B5FD' }}>
              {lang === 'hindi'
                ? 'जिनी का AI विश्लेषण पूरा हुआ — आपकी ग्रह स्थिति से गहरी भविष्यवाणी'
                : lang === 'english'
                ? 'Jini\'s AI analysis complete — deeper prediction from your exact planetary positions'
                : 'Jini ka AI analysis complete — aapki exact planetary positions se gehri prediction'}
            </span>
          </div>
        )}

        {/* ── SUSPENSE HOOK ── */}
        <div style={{
          borderTop:  `1px solid ${GOLD_RGBA(0.08)}`,
          paddingTop: 14,
          display:    'flex',
          alignItems: 'flex-start',
          gap:         10,
        }}>
          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>🌟</span>
          <p style={{
            fontSize:   13,
            color:      GOLD_RGBA(0.75),
            fontWeight: 500,
            lineHeight: 1.65,
            fontStyle:  'italic',
          }}>
            {lang === 'hindi'
              ? `${name.split(' ')[0]} जी — आपकी कुंडली में एक और रहस्य है। एक विशेष तारीख जो आपका जीवन बदल सकती है। पूरी पढ़ाई में वह तारीख सामने आएगी...`
              : lang === 'english'
              ? `${name.split(' ')[0]} — there's one more secret in your chart. A specific date that could change everything. It reveals in your full reading...`
              : `${name.split(' ')[0]} ji — aapke chart mein ek aur raaz hai. Ek specific date jo aapki zindagi badal sakti hai. Poori reading mein woh date reveal hogi...`}
          </p>
        </div>
      </div>

      {/* ── CTA BUTTONS — 2 column grid ── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: '1fr 1fr',
        gap:                  10,
        marginBottom:         10,
      }}>
        {/* 30-Day Reading */}
        <a
          href="/result#pricing"
          style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            gap:             4,
            padding:        '14px 10px',
            background:     GOLD_RGBA(0.08),
            border:         `1px solid ${GOLD_RGBA(0.3)}`,
            borderRadius:    12,
            textDecoration: 'none',
            cursor:         'pointer',
          }}
        >
          <span style={{ fontSize: 20 }}>📅</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: GOLD, textAlign: 'center' }}>
            {lang === 'hindi' ? '30 दिन की रीडिंग' : lang === 'english' ? '30-Day Reading' : '30 Din ki Reading'}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(148,163,184,0.55)', textAlign: 'center' }}>
            {lang === 'hindi' ? 'हर हफ्ते का मार्गदर्शन' : lang === 'english' ? 'Week-by-week guidance' : 'Week-by-week guidance'}
          </span>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: '#080B12', background: GOLD,
            padding: '3px 14px', borderRadius: 20, marginTop: 2,
          }}>
            ₹51
          </span>
        </a>

        {/* Full Life Reading */}
        <a
          href="/result#pricing"
          style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            gap:             4,
            padding:        '14px 10px',
            background:     PURPLE_RGBA(0.1),
            border:         `2px solid ${PURPLE_RGBA(0.4)}`,
            borderRadius:    12,
            textDecoration: 'none',
            cursor:         'pointer',
            position:       'relative',
            overflow:       'hidden',
          }}
        >
          <div style={{
            position:     'absolute', top: 0, right: 0,
            background:   PURPLE,
            fontSize:      9, fontWeight: 700, color: '#fff',
            padding:      '2px 8px',
            borderRadius: '0 12px 0 8px',
          }}>
            POPULAR
          </div>
          <span style={{ fontSize: 20 }}>🔮</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#C4B5FD', textAlign: 'center' }}>
            {lang === 'hindi' ? 'पूरी ज़िंदगी रीडिंग' : lang === 'english' ? 'Full Life Reading' : 'Poori Zindagi Reading'}
          </span>
          <span style={{ fontSize: 11, color: 'rgba(148,163,184,0.55)', textAlign: 'center' }}>
            {lang === 'hindi' ? 'दशा + गोचर + उपाय' : lang === 'english' ? 'Dasha + Transit + Remedy' : 'Dasha + Gochar + Remedy'}
          </span>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: '#fff', background: PURPLE,
            padding: '3px 14px', borderRadius: 20, marginTop: 2,
          }}>
            ₹99
          </span>
        </a>
      </div>

      {/* ── TRIKAL TAGLINE ── */}
      <div style={{
        textAlign:  'center',
        padding:    '10px 16px',
        background: GOLD_RGBA(0.03),
        border:     `1px solid ${GOLD_RGBA(0.08)}`,
        borderRadius: 10,
      }}>
        <p style={{
          fontSize:  11,
          color:     GOLD_RGBA(0.45),
          fontStyle: 'italic',
        }}>
          {lang === 'hindi'
            ? '"काल बड़ा बलवान है — और आपका काल, आपकी कुंडली में लिखा है"'
            : lang === 'english'
            ? '"Time is the greatest force — and your time is written in your Kundali"'
            : '"Kaal bada balwan hai — aur aapka Kaal, aapki Kundali mein likha hai"'}
        </p>
        <p style={{ fontSize: 10, color: 'rgba(100,116,139,0.5)', marginTop: 4 }}>
          Rohiit Gupta · Chief Vedic Architect · Trikal Vaani
        </p>
      </div>

      {/* Blink animation */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
