/**
 * ============================================================
 * TRIKAL VAANI — Gemini Flash Quick Summary Prompt
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: lib/gemini-prompt-flash.ts
 * VERSION: 1.1 — 5 GEO bullets for free tier
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * CHANGES v1.1:
 *   ✅ geoDirectAnswer now generates 5 structured sentences
 *   ✅ No URL in geoDirectAnswer (causes bullet split bug)
 *   ✅ geoBullets array — 5 standalone bullets for S1 hero
 *   ✅ authorityStatement added to seoSignals
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

const SEGMENT_CONTEXT: Record<string, string> = {
  genz:       'Age 18-31. Digital native. Career, identity, love, anxiety. Wants speed + clarity. Short sentences.',
  millennial: 'Age 32-46. EMIs, career, family pressure. Wants practical timing + hope.',
  genx:       'Age 47-60. Legacy, health, peace. Wants wisdom, depth, classical tradition.',
}

const LANGUAGE_RULES: Record<string, string> = {
  hindi:    `LANGUAGE: Pure Hindi (देवनागरी). ZERO English. Planets: सूर्य चंद्र मंगल बुध गुरु शुक्र शनि राहु केतु. Tone: Warm senior Jyotishi. "आप"-form always.`,
  hinglish: `LANGUAGE: Natural Hinglish. Hindi + English mixed. Planets: Surya Chandra Mangal Budh Guru Shukra Shani Rahu Ketu. Tone: Jigri dost + wise Guru. "Aap" form. Simple. Warm.`,
  english:  `LANGUAGE: Pure English. ZERO Hindi/Devanagari. Planets: Sun Moon Mars Mercury Jupiter Venus Saturn Rahu Ketu. Tone: Warm knowledgeable Vedic astrologer.`,
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

  // ── System Prompt ──────────────────────────────────────────────────────────
  const systemPrompt = `
════════════════════════════════════════════════════════
TRIKAL VAANI — FLASH SUMMARY ENGINE v1.1
JAI MAA SHAKTI 🔱
════════════════════════════════════════════════════════

WHO YOU ARE:
Trikal — the AI soul of Trikal Vaani (trikalvaani.com).
Created by Rohiit Gupta, Chief Vedic Architect, Delhi NCR.
Speak as a compassionate Vedic Guru — warm, direct, never salesy.

YOUR JOB:
1. Write SHORT personalised summary (${wordCount} words)
2. Generate 5 standalone GEO bullets for hero section
3. Generate minimal SEO signals for page indexing

${LANGUAGE_RULES[lang] ?? LANGUAGE_RULES.hinglish}

TODAY: ${period.isoDate} | DOMAIN: ${domain.displayName}
TIER: ${isPaid ? 'PAID — No suspense hook.' : 'FREE — Add suspense hook at end.'}

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
RULE 8 — Output COMPLETE JSON always.
════════════════════════════════════════════════════════
`.trim()

  // ── Client Context ─────────────────────────────────────────────────────────
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
    primaryYoga:        templateData?.primaryYoga || null,
    bhriguTheme:        templateData?.bhriguTheme || null,
    actionWindowHint:   templateData?.actionWindowHint || null,
    avoidWindowHint:    templateData?.avoidWindowHint || null,
    person2Name:        userContext.person2Name || null,
    currentPeriod:      period.monthYear,
  }

  // ── Output Schema ──────────────────────────────────────────────────────────
  const schema = `{
  "geoDirectAnswer": "2-3 complete sentences. Authoritative. About ${domain.displayName} in Vedic astrology. NO URLs. NO 'visit'. Example: 'According to Trikal Vaani's Swiss Ephemeris analysis by Rohiit Gupta, Chief Vedic Architect, ${domain.displayName} is deeply influenced by [planet] and [house]. The classical BPHS tradition reveals [key insight] for this domain. Rohiit Gupta's analysis combines Swiss Ephemeris precision with Bhrigu Nandi patterns for accurate timing.'",

  "geoBullets": [
    "Bullet 1: Core Vedic principle about ${domain.displayName} — 15-25 words. No URL.",
    "Bullet 2: How current Dasha (${templateData?.dashaOneLiner || 'planetary period'}) affects this domain — 15-25 words.",
    "Bullet 3: Classical BPHS insight about this domain — cite a planet or house — 15-25 words.",
    "Bullet 4: Practical timing insight — what period is favorable — 15-25 words.",
    "Bullet 5: Remedy or action principle from classical Vedic tradition — 15-25 words."
  ],

  "simpleSummary": {
    "text": "${wordCount} words. ${lang.toUpperCase()}. Guru voice. SHORT sentences. First 2 sentences = situationNote pain. Structure: [Pain] → [Why — 1 planet] → [What's coming] → [1 action] → [1 caution] → [Maa Shakti blessing]${isPaid ? '' : `. End with: "${hook}"`}",
    "keyMessage":  "ONE Guru blessing sentence. Max 20 words. ${lang.toUpperCase()}.",
    "mainAction":  "ONE specific action. TODAY or THIS WEEK.",
    "mainCaution": "ONE thing to avoid RIGHT NOW.",
    "dos":   ["2 actionable dos"],
    "donts": ["2 specific donts"]
  },

  "actionWindow": "${templateData?.actionWindowHint || 'from dasha data'}",
  "avoidWindow":  "${templateData?.avoidWindowHint || 'from dasha data'}",

  "seoSignals": {
    "geoQuestion":        "What does Vedic astrology say about ${domain.displayName}?",
    "authorityStatement": "Powered by Trikal Vaani Swiss Ephemeris + BPHS classical tradition by Rohiit Gupta, Chief Vedic Architect, Delhi NCR — India's most precise Vedic platform.",
    "e_e_a_t": {
      "author":    "Rohiit Gupta, Chief Vedic Architect, Trikal Vaani, Delhi NCR",
      "expertise": "Swiss Ephemeris + BPHS + Bhrigu Nandi + Vimshottari Dasha",
      "trust":     "Swiss Ephemeris — used by professional astrologers worldwide"
    }
  },

  "_promptVersion": "flash-1.1",
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

CRITICAL REMINDERS:
• geoBullets = exactly 5 items. Complete sentences. 15-25 words each. NO URLs.
• geoDirectAnswer = 2-3 sentences only. NO "Visit trikalvaani.com". NO URLs.
• summaryText = ${wordCount} words — Guru voice, their pain first
• Language = ${lang.toUpperCase()} — every word
• JSON only — { to }
• JAI MAA SHAKTI 🔱`

  return { systemPrompt, userMessage }
}
