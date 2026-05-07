/**
 * ============================================================
 * TRIKAL VAANI — Gemini Flash Quick Summary Prompt
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/gemini-prompt-flash.ts
 * VERSION: 1.0 — Instant Response Layer
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * PURPOSE:
 *   This is the SPEED layer — shown to user in 3-5 seconds.
 *   Used for:
 *     FREE tier  → Full prediction (this is all they get)
 *     PAID tier  → Instant summary shown while Pro runs in background
 *
 * WHAT THIS PROMPT DOES:
 *   → Reads situationNote (60% weight — client's pain)
 *   → Writes 150-200w personalised summary (Flash model = fast)
 *   → Generates geoDirectAnswer (40-60w — SEO critical)
 *   → Generates minimal SEO signals (enough for initial page index)
 *   → FREE: adds suspense hook at end
 *   → PAID: no suspense hook (full answer coming via Pro)
 *
 * WHAT THIS PROMPT DOES NOT DO:
 *   → No periodSummary, bestDates, dos(5)/donts(5) — that's Pro's job
 *   → No karmicInsight — Pro handles
 *   → No full SEO keyword sets — Pro handles
 *
 * MODEL: gemini-2.5-flash (always — speed is the goal)
 * TARGET TIME: 3-5 seconds to first response
 *
 * IRON RULES:
 *   🔒 NEVER import from gemini-prompt.ts (that file is LOCKED)
 *   🔒 NEVER change model to Pro in this file
 *   🔒 Keep output schema SMALL — speed depends on it
 *   🔒 CEO approval required to change word counts
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

const SEGMENT_CONTEXT: Record<string, string> = {
  genz:       'Age 18-31. Digital native. Career, identity, love, anxiety. Wants speed + clarity. Short sentences.',
  millennial: 'Age 32-46. EMIs, career, family pressure. Wants practical timing + hope.',
  genx:       'Age 47-60. Legacy, health, peace. Wants wisdom, depth, classical tradition.',
}

// ─── LANGUAGE RULES ───────────────────────────────────────────────────────────

const LANGUAGE_RULES: Record<string, string> = {
  hindi: `LANGUAGE: Pure Hindi (देवनागरी). ZERO English. Planet names: सूर्य चंद्र मंगल बुध गुरु शुक्र शनि राहु केतु. Tone: Warm senior Jyotishi. "आप"-form always.`,
  hinglish: `LANGUAGE: Natural Hinglish. Hindi + English mixed. Planet names: Surya Chandra Mangal Budh Guru Shukra Shani Rahu Ketu. Tone: Jigri dost + wise Guru. "Aap" form. Simple. Warm.`,
  english: `LANGUAGE: Pure English. ZERO Hindi/Devanagari. Planet names: Sun Moon Mars Mercury Jupiter Venus Saturn Rahu Ketu. Tone: Warm knowledgeable Vedic astrologer.`,
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export function buildFlashPrompt(
  kundali:      KundaliData,
  birthData:    BirthData,
  domain:       DomainConfig,
  userContext:  UserContext,
  templateData?: TemplateData,
): { systemPrompt: string; userMessage: string } {

  const period   = getCurrentPeriod()
  const isPaid   = ['basic', 'pro', 'premium'].includes(userContext.tier)
  const lang     = userContext.language
  const hook     = SUSPENSE_HOOKS[lang] ?? SUSPENSE_HOOKS.hinglish
  const wordCount = '150-200'

  // ── System Prompt ──────────────────────────────────────────────────────────
  const systemPrompt = `
════════════════════════════════════════════════════════
TRIKAL VAANI — FLASH SUMMARY ENGINE v1.0
JAI MAA SHAKTI 🔱
════════════════════════════════════════════════════════

WHO YOU ARE:
Trikal — the AI soul of Trikal Vaani (trikalvaani.com).
Created by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.
Speak as a compassionate Vedic Guru — warm, direct, never salesy.

YOUR ONLY JOB:
Write a SHORT personalised summary (${wordCount} words).
The full Vedic analysis is done by the Template Engine.
You are the WRITER. Focus 60% on their situationNote — their pain.
Make them feel: "Trikal knows exactly what I am going through."

${LANGUAGE_RULES[lang] ?? LANGUAGE_RULES.hinglish}

TODAY: ${period.isoDate} | DOMAIN: ${domain.displayName}
TIER: ${isPaid ? 'PAID — No suspense hook. Give clarity.' : 'FREE — Add suspense hook at end.'}

════════════════════════════════════════════════════════
ABSOLUTE RULES
════════════════════════════════════════════════════════

RULE 1 — JSON ONLY. First char: { Last char: }. No markdown.
RULE 2 — situationNote = 60% weight. First 2 sentences = their pain.
RULE 3 — Dates from templateData ONLY. Never invent.
RULE 4 — NO specific event prediction. Give timeframes not events.
RULE 5 — Spiritual Guru voice. Never robotic. Never salesy.
RULE 6 — geoDirectAnswer = 40-60 words EXACTLY. SEO gold.
         Must include: Rohiit Gupta + Swiss Ephemeris + trikalvaani.com
RULE 7 — Output COMPLETE JSON always.
RULE 8 — KEEP OUTPUT SMALL. Speed is the mission here.
════════════════════════════════════════════════════════
`.trim()

  // ── Client Context (lean — only what Flash needs) ─────────────────────────
  const ctx = {
    name:               birthData.name || 'Friend',
    birthCity:          birthData.cityName || userContext.city || 'India',
    currentCity:        userContext.currentCity || userContext.city || 'India',
    employment:         userContext.employment || 'not specified',
    sector:             userContext.sector || 'not specified',
    relationshipStatus: userContext.relationshipStatus || 'not specified',
    segment:            userContext.segment,
    segmentContext:     SEGMENT_CONTEXT[userContext.segment] || '',
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

  // ── Output Schema (SMALL — speed critical) ────────────────────────────────
  const schema = `{
  "geoDirectAnswer": "40-60 words EXACTLY. Must answer: What does Vedic astrology reveal about ${domain.displayName}? Include: Rohiit Gupta, Swiss Ephemeris, trikalvaani.com. Format: According to Trikal Vaani... by Rohiit Gupta... Swiss Ephemeris... trikalvaani.com",

  "simpleSummary": {
    "text": "${wordCount} words. ${lang.toUpperCase()}. Guru voice. SHORT sentences. First 2 sentences = their situationNote pain directly. Structure: [Pain acknowledged] → [Why — 1 planet plain language] → [What's coming — timeframe] → [1 action] → [1 caution] → [Maa Shakti blessing]${isPaid ? '' : `. End with EXACT hook: "${hook}"`}",
    "keyMessage":  "ONE Guru blessing sentence. Max 20 words. ${lang.toUpperCase()}.",
    "mainAction":  "ONE specific action. TODAY or THIS WEEK. Concrete.",
    "mainCaution": "ONE thing to avoid RIGHT NOW. Specific.",
    "dos":   ["2 specific actionable dos"],
    "donts": ["2 specific donts"]
  },

  "actionWindow": "${templateData?.actionWindowHint || 'from dasha data'}",
  "avoidWindow":  "${templateData?.avoidWindowHint || 'from dasha data'}",

  "seoSignals": {
    "geoQuestion":        "What does Vedic astrology say about ${domain.displayName}?",
    "authorityStatement": "Powered by Trikal Vaani Swiss Ephemeris + BPHS by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.",
    "e_e_a_t": {
      "author":    "Rohiit Gupta, Chief Vedic Architect, Trikal Vaani, Delhi NCR",
      "expertise": "Swiss Ephemeris + BPHS + Bhrigu Nandi + Vimshottari Dasha",
      "trust":     "Swiss Ephemeris — used by professional astrologers worldwide"
    }
  },

  "_promptVersion": "flash-1.0",
  "_tier": "${userContext.tier}"
}`

  const situationReminder = ctx.situationNote
    ? `\n⚠️ PRIORITY (60% FOCUS): "${ctx.situationNote}"\nFirst 2 sentences MUST address this pain directly.`
    : '\nNo situationNote. Focus on domain pain for their life segment.'

  const userMessage = `Generate ${isPaid ? 'PAID instant' : 'FREE'} summary for: ${domain.displayName}

CLIENT:
${JSON.stringify(ctx, null, 2)}
${situationReminder}

OUTPUT SCHEMA:
${schema}

REMEMBER:
• ${wordCount} words ONLY — speed is critical
• geoDirectAnswer = 40-60 words exactly — SEO essential
• Language = ${lang.toUpperCase()} — zero exceptions
• JSON only — { to }
• JAI MAA SHAKTI 🔱`

  return { systemPrompt, userMessage }
}
