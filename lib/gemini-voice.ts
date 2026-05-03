/**
 * ============================================================
 * TRIKAL VAANI — Jini Voice Prompt Engine
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/gemini-voice.ts
 * VERSION: 1.0 — Separate Voice Engine
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ARCHITECTURE:
 *   This is a COMPLETELY SEPARATE file from gemini-prompt.ts
 *   Zero overlap. Zero confusion for Gemini.
 *   gemini-prompt.ts → Text summary (Free + Paid)
 *   gemini-voice.ts  → Voice script ONLY
 *
 * VOICE SPEC:
 *   Output:   90-120 words spoken script
 *   Persona:  Jini — Female, calm, slightly slow, daily touch
 *   Language: User selected (Hindi / Hinglish / English)
 *   Model:    Gemini 2.5 Flash (fast + affordable)
 *   Polish:   Claude Sonnet 4.6 (always — voice quality non-negotiable)
 *   TTS:      Google TTS Neural2 Hindi (Phase 4)
 *
 * CONTENT WEIGHTS:
 *   60% → situationNote (client's pain — voice input up to 1 min)
 *   20% → Mobile + DOB + current location (personalisation anchor)
 *   20% → Dasha summary (MD + AD + PD + SD in plain language)
 *
 * VOICE INPUT:
 *   Client speaks up to 1 minute about their situation
 *   Transcribed via Google STT → becomes situationNote
 *   This makes voice MORE personal than typed text
 *
 * COST:
 *   Gemini Flash: ~₹0.03/script
 *   Claude polish: ~₹0.80/script
 *   Google TTS:   ~₹0.04/audio
 *   Total:        ~₹0.87/voice prediction
 *   Revenue:      ₹11
 *   Margin:       ₹10.13 = 92% 🔥
 * ============================================================
 */

import type { KundaliData, BirthData } from './swiss-ephemeris';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type VoiceLanguage = 'hindi' | 'hinglish' | 'english';

export interface VoiceContext {
  // Client identity (20% weight)
  name:          string;
  dob:           string;          // Date of birth
  currentCity:   string;          // Where they live NOW
  mobile?:       string;          // Last 4 digits for personalisation only

  // Their pain (60% weight)
  situationNote: string;          // Voice input transcribed (up to 1 min)

  // Dasha (20% weight)
  mahadasha:     string;          // Mahadasha lord
  antardasha:    string;          // Antardasha lord
  pratyantar:    string;          // Pratyantar lord
  sookshma:      string;          // Sookshma lord
  dashaQuality:  string;          // 'Shubh' | 'Madhyam' | 'Ashubh'
  dashaOneLiner: string;          // "Aap ek expansion ke daur mein hain"

  // Language
  language:      VoiceLanguage;

  // Domain context
  domainId:      string;
  domainLabel:   string;          // "Career", "Love", "Karz Mukti" etc.
}

export interface VoicePromptOutput {
  systemPrompt: string;
  userMessage:  string;
  model:        string;   // Always 'gemini-2.5-flash' for voice
  maxTokens:    number;   // Small — voice script only
}

// ─── JINI VOICE PERSONA ───────────────────────────────────────────────────────
// Female · Calm · Slightly slow · Daily touch
// Like a wise elder sister who knows astrology

const JINI_VOICE_PERSONA = {
  hindi: `
तुम जिनी हो — त्रिकाल वाणी की आत्मा।
तुम एक शांत, ममतामयी बड़ी बहन की तरह बोलती हो।
धीरे-धीरे, स्पष्ट, दिल से।
तुम्हारी आवाज़ में Maa Shakti का आशीर्वाद है।
तुम कभी जल्दी नहीं करतीं — हर शब्द सोचकर बोलती हो।`,

  hinglish: `
You are Jini — the soul of Trikal Vaani.
You speak like a calm, caring elder sister who knows the stars.
Warm. Slow. Clear. Heart-to-heart.
Hinglish — natural mix of Hindi and English.
Never rushed. Every word matters.
Maa Shakti ka ashirwad har shabd mein hai.`,

  english: `
You are Jini — the soul of Trikal Vaani.
You speak like a calm, wise elder sister.
Warm. Measured. Clear. Deeply caring.
Pure English — no Hindi words.
Your voice carries the blessing of ancient Vedic wisdom.`,
};

// ─── VOICE LANGUAGE RULES ─────────────────────────────────────────────────────

const VOICE_LANGUAGE_RULES = {
  hindi: `
LANGUAGE: Pure Hindi — ONLY देवनागरी script.
Planet names: सूर्य · चंद्र · मंगल · बुध · गुरु · शुक्र · शनि · राहु · केतु
ZERO English words. ZERO Roman script.
Write as it will be SPOKEN — natural, flowing sentences.
Avoid: technical terms, house numbers, degree values.
Use: "एक शक्तिशाली ग्रह" not "Jupiter in 7th house"`,

  hinglish: `
LANGUAGE: Natural Hinglish — Hindi + English mixed as spoken in India.
Planet names: Surya · Chandra · Mangal · Budh · Guru · Shukra · Shani · Rahu · Ketu
Write as it will be SPOKEN aloud — natural conversational flow.
Avoid: technical jargon, house numbers, degree values.
Use: "Guru ki meherbani hai abhi" not "Jupiter is in 9th house"
Short sentences. Natural pauses (use comma). Warm rhythm.`,

  english: `
LANGUAGE: Pure English — ZERO Hindi or Devanagari.
Planet names: Sun · Moon · Mars · Mercury · Jupiter · Venus · Saturn · Rahu · Ketu
Write as it will be SPOKEN aloud — natural, flowing speech.
Avoid: technical jargon, house numbers, degree values.
Use: "Jupiter is blessing you right now" not "Jupiter in 9th house Sagittarius"
Calm, measured sentences. Natural pauses. Warm British-Indian English tone.`,
};

// ─── DOMAIN VOICE OPENERS ─────────────────────────────────────────────────────
// First sentence sets the tone for the entire voice note
// Spiritual + personal + domain-specific

const DOMAIN_VOICE_OPENERS: Record<string, Record<VoiceLanguage, string>> = {
  mill_karz_mukti: {
    hindi:    '[Name] ji, Maa Shakti jaanti hain ki aap kaafi mushkilon mein hain abhi.',
    hinglish: '[Name] ji, Jini jaanti hai ki yeh waqt aapke liye kitna bhaari hai.',
    english:  '[Name], Jini knows how heavy this time feels for you.',
  },
  genz_ex_back: {
    hindi:    '[Name] ji, pyaar ka dard sabse gehra hota hai — Maa Shakti aapke saath hain.',
    hinglish: '[Name] ji, dil ki baat sun li Jini ne — aaj kuch important batana hai.',
    english:  '[Name], Jini hears your heart — and the stars have something important to share.',
  },
  genz_dream_career: {
    hindi:    '[Name] ji, aapका करियर का सपना — वो पूरा होगा, बस सही वक्त आना बाकी है।',
    hinglish: '[Name] ji, career ki tension samajh aati hai — par kundali mein jo likha hai woh sunno.',
    english:  '[Name], your career calling is written in the stars — Jini will show you the timing.',
  },
  genz_toxic_boss: {
    hindi:    '[Name] ji, kaam ki jagah ka dard bahut thaka deta hai — aaj clarity milegi.',
    hinglish: '[Name] ji, office ki situation bahut drain kar rahi hai aapko — Jini samjhi.',
    english:  '[Name], workplace struggles drain the soul — Jini sees the karmic pattern clearly.',
  },
  mill_property_yog: {
    hindi:    '[Name] ji, apna ghar — yeh sapna bahut khaas hota hai, aaj iska sach sunein.',
    hinglish: '[Name] ji, property ka sawaal bahut bada hai — kundali kya kehti hai sunno.',
    english:  '[Name], owning a home is a sacred dream — let the stars guide your timing.',
  },
  genx_retirement_peace: {
    hindi:    '[Name] ji, zindagi ke is paav mein sukoon ka haq aapka hai.',
    hinglish: '[Name] ji, is stage mein shanti chahiye — aur kundali woh raah dikha sakti hai.',
    english:  '[Name], this chapter of life deserves peace — and your chart shows the path.',
  },
  genx_spiritual_innings: {
    hindi:    '[Name] ji, aapकी आत्मा एक ऊंची यात्रा पर है — आज उसकी बात करते हैं।',
    hinglish: '[Name] ji, aapki aatma kuch aur chahti hai — Ketu woh raaz kholta hai.',
    english:  '[Name], your soul is on a higher journey — Ketu reveals the sacred path.',
  },
  default: {
    hindi:    '[Name] ji, aaj Jini aapke liye kuch khaas layi hai — dhyan se sunein.',
    hinglish: '[Name] ji, aaj ki kundali mein jo hai woh Jini aapko bata rahi hai.',
    english:  '[Name], Jini has something meaningful to share with you today.',
  },
};

function getOpener(domainId: string, language: VoiceLanguage, name: string): string {
  const openers = DOMAIN_VOICE_OPENERS[domainId] ?? DOMAIN_VOICE_OPENERS['default']!;
  return (openers[language] ?? openers['hinglish']!).replace('[Name]', name);
}

// ─── DASHA PLAIN LANGUAGE ────────────────────────────────────────────────────
// Convert technical Dasha data to spoken language

function buildDashaVoiceLine(
  ctx:      VoiceContext,
  language: VoiceLanguage,
): string {
  const quality = ctx.dashaQuality;
  const md      = ctx.mahadasha;
  const ad      = ctx.antardasha;
  const pd      = ctx.pratyantar;

  const qualityMap = {
    Shubh:   { h: 'शुभ और अनुकूल', hi: 'favorable aur shubh', e: 'favorable and auspicious' },
    Madhyam: { h: 'मिला-जुला', hi: 'mixed — theek-theek', e: 'mixed and moderate' },
    Ashubh:  { h: 'चुनौतीपूर्ण', hi: 'challenging — thoda mushkil', e: 'challenging but temporary' },
  };

  const qText = qualityMap[quality as keyof typeof qualityMap] ?? qualityMap['Madhyam'];

  if (language === 'hindi') {
    return `अभी आपकी ${md} महादशा और ${ad} अंतर्दशा चल रही है — यह समय ${qText.h} है। ${pd} प्रत्यंतर दशा अभी सबसे ज़्यादा असर कर रही है।`;
  } else if (language === 'english') {
    return `You are currently in ${md} Mahadasha with ${ad} Antardasha — this period is ${qText.e}. The ${pd} Pratyantar is most active right now.`;
  } else {
    return `Abhi aap ${md} Mahadasha aur ${ad} Antardasha mein hain — yeh waqt ${qText.hi} hai. ${pd} Pratyantar sabse zyada active hai abhi.`;
  }
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function buildVoicePrompt(ctx: VoiceContext): VoicePromptOutput {
  const lang    = ctx.language;
  const opener  = getOpener(ctx.domainId, lang, ctx.name);
  const dashaLine = buildDashaVoiceLine(ctx, lang);

  const systemPrompt = buildVoiceSystemPrompt(ctx, opener, dashaLine);
  const userMessage  = buildVoiceUserMessage(ctx, opener, dashaLine);

  return {
    systemPrompt,
    userMessage,
    model:     'gemini-2.5-flash',   // Fast + lean for voice
    maxTokens: 400,                  // 90-120 words = ~150-200 tokens + buffer
  };
}

// ─── VOICE SYSTEM PROMPT ──────────────────────────────────────────────────────

function buildVoiceSystemPrompt(
  ctx:      VoiceContext,
  opener:   string,
  dashaLine: string,
): string {

  return `
════════════════════════════════════════════════════════════════
TRIKAL VAANI — JINI VOICE ENGINE v1.0
JAI MAA SHAKTI 🔱
════════════════════════════════════════════════════════════════

${JINI_VOICE_PERSONA[ctx.language]}

${VOICE_LANGUAGE_RULES[ctx.language]}

════════════════════════════════════════════════════════════════
VOICE RULES — NON-NEGOTIABLE
════════════════════════════════════════════════════════════════

RULE 1 — PLAIN TEXT ONLY
Return ONLY the spoken script as plain text.
NO JSON. NO markdown. NO asterisks. NO bullet points.
This text goes DIRECTLY to Google Text-to-Speech.

RULE 2 — 90-120 WORDS EXACTLY
Count every word. Stay in range.
Too short = feels incomplete. Too long = TTS cuts off.

RULE 3 — SPOKEN LANGUAGE ONLY
Write as people SPEAK — not as they write.
Short sentences. Natural pauses (comma = pause).
No technical terms. No house numbers. No degrees.
WRONG: "Jupiter in 9th house Sagittarius at 15 degrees"
RIGHT: "Guru ki meherbani hai aaj aap par"

RULE 4 — SITUATION NOTE IS SOUL (60% WEIGHT)
Whatever the client spoke about — address it directly.
They spoke for up to 1 minute. That is their truth.
First 2-3 sentences must acknowledge their specific pain.
Make them feel: "Jini was listening to every word."

RULE 5 — FEMALE CALM VOICE RHYTHM
Short sentences. Comma pauses. Warm endings.
Never rush. Never pack too much in one sentence.
Each sentence should breathe.
Example rhythm: "Aap theek ho. Aaj kuch acha hoga. Shani ki nazar thodi hat rahi hai."

RULE 6 — END WITH MAA SHAKTI BLESSING
Always end with a 1-sentence blessing from Maa Shakti.
This is Jini's signature — never skip it.
Examples:
  Hindi: "Maa Shakti aapके साथ हैं — यह कठिन समय जल्द बीतेगा।"
  Hinglish: "Maa Shakti aapke saath hain — yeh waqt bhi guzar jayega."
  English: "Maa Shakti walks beside you — this difficult time shall pass."

RULE 7 — PERSONALISATION ANCHOR
Use their name naturally 1-2 times in the script.
Reference their current city if contextually relevant.
Never mention mobile number in the script.
════════════════════════════════════════════════════════════════
`.trim();
}

// ─── VOICE USER MESSAGE ───────────────────────────────────────────────────────

function buildVoiceUserMessage(
  ctx:       VoiceContext,
  opener:    string,
  dashaLine: string,
): string {

  const lang = ctx.language;

  // Personalisation block (20% weight)
  const personBlock = [
    `Name: ${ctx.name}`,
    `DOB: ${ctx.dob}`,
    `Current City: ${ctx.currentCity}`,
    ctx.mobile ? `Mobile ending: ...${ctx.mobile.slice(-4)}` : '',
  ].filter(Boolean).join('\n');

  // Dasha block (20% weight)
  const dashaBlock = `
Mahadasha:  ${ctx.mahadasha}
Antardasha: ${ctx.antardasha}
Pratyantar: ${ctx.pratyantar}
Sookshma:   ${ctx.sookshma}
Quality:    ${ctx.dashaQuality}
Plain line: ${dashaLine}
`.trim();

  // Situation block (60% weight)
  const situationBlock = ctx.situationNote
    ? `CLIENT SPOKE (up to 1 min voice input):\n"${ctx.situationNote}"\nThis is their truth — 60% of your script should address this.`
    : `No voice input provided. Focus on ${ctx.domainLabel} pain point for their life stage.`;

  // Structure guide
  const structureGuide = lang === 'hindi'
    ? `
संरचना (90-120 शब्द):
1. [ओपनर — 1 वाक्य]: "${opener}"
2. [उनकी स्थिति — 2-3 वाक्य]: उनके situationNote को address करें
3. [दशा — 1-2 वाक्य]: सरल भाषा में आज का समय
4. [एक काम — 1 वाक्य]: अभी क्या करें
5. [आशा — 1 वाक्य]: हिम्मत दें
6. [Maa Shakti आशीर्वाद — 1 वाक्य]: अंत में हमेशा`

    : lang === 'english'
    ? `
STRUCTURE (90-120 words):
1. [Opener — 1 sentence]: "${opener}"
2. [Their situation — 2-3 sentences]: Address their situationNote directly
3. [Dasha — 1-2 sentences]: Today's planetary energy in plain language
4. [One action — 1 sentence]: What to do right now
5. [Hope — 1 sentence]: Give them strength
6. [Maa Shakti blessing — 1 sentence]: Always end with this`

    : `
STRUCTURE (90-120 words):
1. [Opener — 1 sentence]: "${opener}"
2. [Unki situation — 2-3 sentences]: SituationNote ko seedha address karo
3. [Dasha — 1-2 sentences]: Aaj ka waqt simple language mein
4. [Ek kaam — 1 sentence]: Abhi kya karein
5. [Himmat — 1 sentence]: Hope do unhe
6. [Maa Shakti ashirwad — 1 sentence]: Har baar end mein yeh zaroori hai`;

  return `Write Jini's voice script for: ${ctx.domainLabel}
Language: ${lang.toUpperCase()}

PERSONALISATION (20% weight):
${personBlock}

SITUATION (60% weight):
${situationBlock}

DASHA CONTEXT (20% weight):
${dashaBlock}

${structureGuide}

CRITICAL REMINDERS:
• 90-120 words EXACTLY — count carefully
• Plain text ONLY — no JSON, no bullets, no markdown
• Spoken language — short sentences, natural pauses
• Female calm voice rhythm — never rushed
• Name used 1-2 times naturally
• End ALWAYS with Maa Shakti blessing
• Language = ${lang.toUpperCase()} — zero exceptions
• JAI MAA SHAKTI 🔱`;
}

// ─── CLAUDE POLISH PROMPT FOR VOICE ──────────────────────────────────────────
// Claude Sonnet 4.6 polishes the voice script
// Focus: natural speech rhythm, emotional warmth, TTS optimization

export function buildVoicePolishPrompt(
  rawScript: string,
  language:  VoiceLanguage,
  name:      string,
): string {
  const langRule = {
    hindi:    'Pure Hindi देवनागरी. Zero English.',
    hinglish: 'Natural Hinglish. Hindi + English as spoken in India.',
    english:  'Pure English. Zero Hindi or Devanagari.',
  };

  return `You are polishing a voice script for Jini — Trikal Vaani's AI astrologer.
This script will be read aloud by Google Text-to-Speech (Neural2 Hindi voice).

LANGUAGE: ${langRule[language]}

POLISH RULES:
1. Keep 90-120 words — do not expand or compress beyond this
2. Improve speech rhythm — short sentences flow better in TTS
3. Remove any technical astrology terms — must sound natural when spoken
4. Ensure warm, calm female voice feel throughout
5. Name "${name}" should appear 1-2 times naturally
6. Maa Shakti blessing MUST be the final sentence
7. No markdown, no bullets, no JSON — plain text only
8. Fix any grammar or flow issues while preserving meaning
9. Make it feel like a caring elder sister speaking — not a robot

RAW SCRIPT TO POLISH:
${rawScript}

Return ONLY the polished script as plain text. Nothing else.`;
}

// ─── VOICE LANGUAGE DETECTOR ─────────────────────────────────────────────────
// Detects language from voice input transcription

export function detectVoiceLanguage(transcription: string): VoiceLanguage {
  if (!transcription) return 'hinglish';

  // Count Devanagari characters
  const devanagariCount = (transcription.match(/[\u0900-\u097F]/g) || []).length;
  const totalChars      = transcription.replace(/\s/g, '').length;

  if (totalChars === 0) return 'hinglish';

  const devanagariRatio = devanagariCount / totalChars;

  if (devanagariRatio > 0.6) return 'hindi';      // Mostly Devanagari = Hindi
  if (devanagariRatio < 0.05) return 'english';   // Mostly Latin = English
  return 'hinglish';                               // Mix = Hinglish
}
