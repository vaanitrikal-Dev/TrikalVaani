/**
 * ============================================================
 * TRIKAL VAANI — Gemini Flash Quick Summary Prompt
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/gemini-prompt-flash.ts
 * VERSION: 1.2 — Dynamic segment + gender + SEO/GEO architect
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * CHANGES v1.2 vs v1.1:
 *   ✅ dynamicSegment from BirthForm v9.0 used in prompt
 *   ✅ gender passed for personalized tone + remedy focus
 *   ✅ age passed for segment context accuracy
 *   ✅ SEGMENT_FOCUS_MAP — 50% weight on mid_male (career/money/property)
 *   ✅ SEO/GEO signals enhanced — trending keywords 2026
 *   ✅ GEO direct answer optimized for Google SGE + Perplexity + SearchGPT
 *
 * IRON RULES:
 *   🔒 NEVER import from gemini-prompt.ts (LOCKED)
 *   🔒 NEVER change model to Pro in this file
 *   🔒 Keep output schema SMALL — speed depends on it
 * ============================================================
 */

import type { KundaliData, BirthData } from './swiss-ephemeris'
import type { DomainConfig }           from './domain-config'
import { getCurrentPeriod }            from './domain-config'
import type { UserContext, TemplateData } from './gemini-prompt'

// ─── SUSPENSE HOOKS (FREE only) ───────────────────────────────────────────────

const SUSPENSE_HOOKS: Record<string, string> = {
  hinglish: 'Lekin... Trikal ne aapki kundali mein kuch aur bhi dekha hai — ek pattern jo seedha aapke sawal ka jawab deta hai. Yeh sirf aapke liye hai. Poori baat ₹51 mein khulegi. Maa Shakti ka ashirwad hai. 🔮',
  hindi:    'परंतु... त्रिकाल ने आपकी कुंडली में कुछ और भी देखा है — एक ऐसा रहस्य जो सीधे आपके प्रश्न का उत्तर देता है। यह केवल आपके लिए है। ₹51 में पूर्ण सत्य प्रकट होगा। मां शक्ति का आशीर्वाद। 🔮',
  english:  "But Trikal has seen something more in your chart — a deeper pattern that speaks directly to your question. This answer is yours alone. The complete truth unlocks at ₹51. Maa Shakti's blessings. 🔮",
}

const LANGUAGE_RULES: Record<string, string> = {
  hindi:    `LANGUAGE: Pure Hindi (देवनागरी). ZERO English. Planets: सूर्य चंद्र मंगल बुध गुरु शुक्र शनि राहु केतु. Tone: Warm senior Jyotishi. "आप"-form always.`,
  hinglish: `LANGUAGE: Natural Hinglish. Hindi + English mixed naturally. Planets: Surya Chandra Mangal Budh Guru Shukra Shani Rahu Ketu. Tone: Jigri dost + wise Guru. "Aap" form. Simple. Warm.`,
  english:  `LANGUAGE: Pure English. ZERO Hindi/Devanagari. Planets: Sun Moon Mars Mercury Jupiter Venus Saturn Rahu Ketu. Tone: Warm knowledgeable Vedic astrologer.`,
}

// ─── DYNAMIC SEGMENT FOCUS MAP ────────────────────────────────────────────────
// Expandable — add new segments without changing prompt logic
// mid_male has 50% weight as per CEO strategy

const SEGMENT_FOCUS: Record<string, string> = {
  // Men
  young_male:   'Age 16-29 Male. PRIMARY: Love, confidence, career start. SECONDARY: Education, social status. TONE: Energetic older brother. PAIN: Job not matching dreams, love life unstable, imposter syndrome, competitive pressure.',
  mid_male:     'Age 30-45 Male. PRIMARY (50% WEIGHT): Career stuck, money not growing, property delayed, not getting respect. SECONDARY: EMI burden, business not scaling, want recognition. TONE: Practical, direct, respect their hustle. This is your CORE demographic.',
  senior_male:  'Age 46-55 Male. PRIMARY: Property legacy, health vitality, government/social respect. SECONDARY: Children settled, retirement planning. TONE: Wise, authoritative, honor their seniority.',
  elder_male:   'Age 56-65 Male. PRIMARY: Health, spiritual peace, legacy. SECONDARY: Family harmony, moksha preparation. TONE: Deep reverence, philosophical.',

  // Women
  young_female:   'Age 16-29 Female. PRIMARY: Love, marriage timing, beauty, career independence. SECONDARY: Family pressure, education. TONE: Empowering elder sister. PAIN: Marriage pressure, love confusion, career vs family.',
  mid_female:     'Age 30-45 Female. PRIMARY: Family harmony, career + home balance, health, marriage quality. SECONDARY: Children education, in-law dynamics. TONE: Warm, acknowledge dual burden.',
  senior_female:  'Age 46-55 Female. PRIMARY: Family harmony, health, spiritual growth. SECONDARY: Property, children marriage. TONE: Dignified, spiritually inclined.',
  elder_female:   'Age 56-65 Female. PRIMARY: Health, spiritual peace, family blessings. SECONDARY: Moksha, grandchildren. TONE: Deep devotion, maternal wisdom.',

  // General (gender not specified)
  young_general:  'Age 16-29. General youth concerns — career, love, identity, education. Speed + clarity needed.',
  mid_general:    'Age 30-45. Career, money, family pressure. Practical timing + hope needed.',
  senior_general: 'Age 46-55. Legacy, health, property, respect. Wisdom + depth needed.',
  elder_general:  'Age 56-65. Health, spiritual peace, family. Reverence + calm needed.',
  millennial_general: 'Age 32-46. EMIs, career, family pressure. Practical solutions + hope + timing.',
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function buildFlashPrompt(
  kundali:      KundaliData,
  birthData:    BirthData,
  domain:       DomainConfig,
  userContext:  UserContext,
  templateData?: TemplateData,
): { systemPrompt: string; userMessage: string } {

  const period    = getCurrentPeriod()
  const isPaid    = ['basic', 'pro', 'premium'].includes(userContext.tier)
  const lang      = userContext.language
  const hook      = SUSPENSE_HOOKS[lang] ?? SUSPENSE_HOOKS.hinglish
  const wordCount = '150-200'

  // Dynamic segment from BirthForm v9.0
  const dynSeg   = (userContext as any).dynamicSegment as string || userContext.segment || 'mid_general'
  const gender   = (userContext as any).gender as string || ''
  const age      = (userContext as any).age as number || 30
  const segFocus = SEGMENT_FOCUS[dynSeg] || SEGMENT_FOCUS['mid_general']!

  // ── System Prompt ──────────────────────────────────────────────────────────
  const systemPrompt = `
════════════════════════════════════════════════════════
TRIKAL VAANI — FLASH SUMMARY ENGINE v1.2
JAI MAA SHAKTI 🔱
════════════════════════════════════════════════════════

WHO YOU ARE:
Trikal — AI soul of Trikal Vaani (trikalvaani.com).
Created by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.
You are also a Senior SEO + GEO Architect building content that ranks on
Google SGE, Perplexity, Gemini, and SearchGPT simultaneously.

YOUR JOB:
1. Write SHORT personalised summary (${wordCount} words) — segment-aware
2. Generate 5 GEO bullets for hero section — AI search optimized
3. Generate SEO signals — trending 2026 keywords + schema-ready

${LANGUAGE_RULES[lang] ?? LANGUAGE_RULES.hinglish}

TODAY: ${period.isoDate} | DOMAIN: ${domain.displayName}
TIER: ${isPaid ? 'PAID — No suspense hook.' : 'FREE — Add suspense hook at end.'}

════════════════════════════════════════════════════════
SEGMENT INTELLIGENCE — USE THIS FOR PERSONALIZATION
════════════════════════════════════════════════════════
CLIENT SEGMENT: ${dynSeg}
GENDER: ${gender || 'not specified'}
AGE: ${age}
SEGMENT FOCUS: ${segFocus}

CRITICAL: First 2 sentences of summary MUST reflect this segment's PRIMARY pain.
If mid_male: address career/money/property/respect — not generic advice.
If young_female: address love/marriage/career balance — specific to her reality.
════════════════════════════════════════════════════════

════════════════════════════════════════════════════════
ABSOLUTE RULES
════════════════════════════════════════════════════════
RULE 1 — JSON ONLY. First: { Last: }. No markdown.
RULE 2 — situationNote = 60% weight. First 2 sentences = their pain.
RULE 3 — Dates from templateData ONLY. Never invent.
RULE 4 — NO specific event prediction. Give timeframes.
RULE 5 — Spiritual Guru voice. Warm. Never robotic.
RULE 6 — geoBullets = 5 items. Each 15-25 words. Complete sentences.
         NEVER include URLs in any bullet. No "trikalvaani.com" in bullets.
RULE 7 — geoDirectAnswer = 2-3 sentences max. NO URL inside it.
         Must be indexable by Google SGE + Perplexity + SearchGPT.
RULE 8 — Output COMPLETE JSON always.
RULE 9 — seoSignals MUST include trending 2026 keywords for this domain.
════════════════════════════════════════════════════════
`.trim()

  // ── Client Context ─────────────────────────────────────────────────────────
  const ctx = {
    name:               birthData.name || 'Friend',
    birthCity:          birthData.cityName || userContext.city || 'India',
    currentCity:        userContext.currentCity || userContext.city || 'India',
    gender:             gender,
    age:                age,
    dynamicSegment:     dynSeg,
    employment:         userContext.employment || 'not specified',
    sector:             userContext.sector || 'not specified',
    relationshipStatus: userContext.relationshipStatus || 'not specified',
    segment:            userContext.segment,
    segmentFocus:       segFocus,
    situationNote:      userContext.situationNote || null,
    dashaOneLiner:      templateData?.dashaOneLiner
                        || `${kundali.currentMahadasha.lord} MD + ${kundali.currentAntardasha.lord} AD`,
    dashaQuality:       templateData?.dashaQuality || 'Madhyam',
    confidenceLabel:    templateData?.confidenceLabel || 'Planetary Support Active',
    lagna:              kundali.lagna,
    nakshatra:          kundali.nakshatra,
    actionWindowHint:   templateData?.actionWindowHint || null,
    avoidWindowHint:    templateData?.avoidWindowHint || null,
    person2Name:        userContext.person2Name || null,
    currentPeriod:      period.monthYear,
  }

  // ── Output Schema ──────────────────────────────────────────────────────────
  const schema = `{
  "geoDirectAnswer": "2-3 sentences. Authoritative. Answers: 'What does Vedic astrology say about ${domain.displayName}?' Include Rohiit Gupta + Swiss Ephemeris + BPHS. Optimized for Google SGE featured snippet. NO URLs. NO 'visit'. Start with a direct factual claim.",

  "geoBullets": [
    "Bullet 1 (Vedic Foundation): Classical BPHS principle about ${domain.displayName} — entity-rich, cite planet or house — 15-25 words",
    "Bullet 2 (Dasha Intelligence): How ${templateData?.dashaOneLiner || 'current planetary period'} specifically affects ${domain.displayName} — 15-25 words",
    "Bullet 3 (Segment-Specific): Insight tailored for ${dynSeg} — their primary concern in ${domain.displayName} — 15-25 words",
    "Bullet 4 (Timing Precision): Favorable period from dasha analysis — specific window — 15-25 words",
    "Bullet 5 (Classical Remedy): BPHS-based remedy principle — mantra or dana — 15-25 words"
  ],

  "simpleSummary": {
    "text": "${wordCount} words. ${lang.toUpperCase()}. Guru voice. SHORT sentences. FIRST 2 SENTENCES MUST address ${dynSeg} primary pain. Structure: [Segment pain] → [Why — 1 planet] → [What is coming] → [1 action] → [1 caution] → [Maa Shakti blessing]${isPaid ? '' : `. End with: "${hook}"`}",
    "keyMessage":  "ONE Guru sentence. Max 20 words. ${lang.toUpperCase()}. Segment-relevant.",
    "mainAction":  "ONE specific action. TODAY or THIS WEEK. Relevant for ${dynSeg}.",
    "mainCaution": "ONE thing to avoid RIGHT NOW. Specific to their segment concerns.",
    "dos":   ["do relevant for ${dynSeg} — practical", "do spiritual — classical remedy"],
    "donts": ["dont 1 — specific to their situation", "dont 2 — with brief reason"]
  },

  "actionWindow": "${templateData?.actionWindowHint || 'from dasha data'}",
  "avoidWindow":  "${templateData?.avoidWindowHint || 'from dasha data'}",

  "seoSignals": {
    "geoQuestion":        "What does Vedic astrology predict about ${domain.displayName} in 2026?",
    "trendingKeywords":   ["${domain.displayName} vedic astrology 2026", "${domain.displayName} kundali prediction", "best astrologer ${domain.displayName} India", "${domain.displayName} jyotish online", "swiss ephemeris ${domain.displayName} analysis"],
    "authorityStatement": "Powered by Trikal Vaani Swiss Ephemeris + BPHS classical by Rohiit Gupta, Chief Vedic Architect, Delhi NCR — India first AI Vedic platform.",
    "geoOptimized":       "Direct answer: [What does Vedic astrology say about ${domain.displayName}] + [How Swiss Ephemeris calculates] + [Classical BPHS insight] — indexed by Google SGE Perplexity SearchGPT",
    "e_e_a_t": {
      "author":    "Rohiit Gupta, Chief Vedic Architect, Trikal Vaani, Delhi NCR",
      "expertise": "Swiss Ephemeris + BPHS + Bhrigu Nandi + Vimshottari Dasha",
      "trust":     "Swiss Ephemeris — used by professional astrologers worldwide"
    }
  },

  "_promptVersion": "flash-1.2",
  "_tier": "${userContext.tier}",
  "_segment": "${dynSeg}"
}`

  const situationReminder = ctx.situationNote
    ? `\n⚠️ PRIORITY (60% FOCUS): "${ctx.situationNote}"\nFirst 2 sentences MUST address this pain directly.`
    : `\nNo situationNote — focus on ${dynSeg} PRIMARY pain for ${domain.displayName}.`

  const userMessage = `Generate ${isPaid ? 'PAID instant' : 'FREE'} summary for: ${domain.displayName}

CLIENT:
${JSON.stringify(ctx, null, 2)}
${situationReminder}

SEGMENT REMINDER: This is a ${dynSeg} client (${gender || 'unspecified gender'}, age ${age}).
Primary concern: ${segFocus.split('PRIMARY:')[1]?.split('SECONDARY:')[0]?.trim() || 'overall wellbeing'}
Adjust every sentence to their real-life reality.

OUTPUT SCHEMA:
${schema}

CRITICAL REMINDERS:
• geoBullets = exactly 5 items. 15-25 words each. NO URLs. Segment-aware.
• geoDirectAnswer = 2-3 sentences. Optimized for Google SGE + Perplexity. NO URLs.
• summaryText = ${wordCount} words. First 2 sentences = ${dynSeg} pain.
• Language = ${lang.toUpperCase()} — every word
• JSON only — { to }
• JAI MAA SHAKTI 🔱`

  return { systemPrompt, userMessage }
}
