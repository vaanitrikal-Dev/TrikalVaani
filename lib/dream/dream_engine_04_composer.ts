// =============================================================================
// TRIKAAL VAANI · Dream Engine · Component 4: THE COMPOSER
// -----------------------------------------------------------------------------
// Turns the tuned reading (Component 3) into the warm bilingual text the user
// sees. Two hard rules are enforced here:
//   • Gemini writes LANGUAGE only — locked to the table's exact meaning. It may
//     not add predictions, dates, numbers, or any new astrological claim.
//   • Rule 0 disclaimers + the two safety messages are attached by CODE, so the
//     legal / safety wording is always exact and never improvised.
//
// Runs on Vercel (TypeScript). The Gemini call is injected (DI) and wired at
// Component 5. Independent of the locked gemini-prompt.ts — never touches it.
// NOTE: all Hindi strings below are structurally verified; Bhai's separate
// Hindi-naturalness proofread still applies before go-live.
// =============================================================================

import type { DreamRow } from './dream_engine_02_resolver';
import type { ResolvedReading } from './dream_engine_03_modifiers';

export type Tier = 'free' | 'paid';
export type GeminiComposeFn = (prompt: string) => Promise<string>; // returns raw JSON string

export interface DreamReadingOutput {
  title_en: string;
  title_hi: string;
  reading_en: string;
  reading_hi: string;
  tendency: 'auspicious' | 'inauspicious' | 'balanced';
  remedy_en: string;
  remedy_hi: string;
  paid_teaser_en: string;   // '' when none / when already paid
  paid_teaser_hi: string;
  disclaimer_en: string;    // exact Rule 0 text
  disclaimer_hi: string;
  citation: string | null;  // public_citation (trust / EEAT)
  signal_strength: 'high' | 'normal' | 'low';
  confidence_tier: string;  // internal trust signal
}

// =============================================================================
// RULE 0 — DISCLAIMERS (exact, code-attached; never Gemini-written)
// =============================================================================
const BASE_DISCLAIMER = {
  en: 'Trikaal Vaani offers Vedic dream interpretation for reflection and guidance. It is not a substitute for professional medical, legal, or financial advice.',
  hi: 'त्रिकाल वाणी चिंतन और मार्गदर्शन हेतु वैदिक स्वप्न व्याख्या प्रस्तुत करती है। यह चिकित्सा, कानूनी या वित्तीय पेशेवर सलाह का विकल्प नहीं है।',
};

const TAG_DISCLAIMERS: Record<string, { en: string; hi: string }> = {
  distress: {
    en: 'This is traditional dream symbolism, not a prediction of events. If any part of this weighs on your mind, please talk with someone you trust.',
    hi: 'यह पारंपरिक स्वप्न प्रतीक है, किसी घटना की भविष्यवाणी नहीं। यदि इसका कोई अंश आपके मन पर भारी लगे, तो कृपया किसी विश्वसनीय व्यक्ति से बात करें।',
  },
  medical: {
    en: 'This is not medical advice. For any health concern, please consult a qualified doctor.',
    hi: 'यह चिकित्सीय सलाह नहीं है। किसी भी स्वास्थ्य चिंता के लिए कृपया योग्य चिकित्सक से परामर्श करें।',
  },
};

// =============================================================================
// RULE 0 — TERMINAL SAFE MESSAGES (used directly by the route; never composed)
// =============================================================================
export const SAFE_MESSAGES = {
  refuse_minor: {
    title_en: 'We cannot interpret this dream',
    title_hi: 'हम इस स्वप्न की व्याख्या नहीं कर सकते',
    body_en:
      "We're not able to interpret this dream. If a child's safety is a concern, please reach out to a trusted adult or the appropriate authorities.",
    body_hi:
      'हम इस स्वप्न की व्याख्या नहीं कर सकते। यदि किसी बच्चे की सुरक्षा की चिंता हो, तो कृपया किसी विश्वसनीय व्यक्ति या उपयुक्त अधिकारियों से संपर्क करें।',
  },
  gender_silent: {
    title_en: 'On this, the tradition is silent',
    title_hi: 'इस विषय पर परंपरा मौन है',
    body_en:
      'The classical dream texts we draw on do not speak to this theme, so we will not put words in their mouth. What we can gently say is that dreams often mirror what is alive in the heart, rather than fixing a set outcome.',
    body_hi:
      'जिन शास्त्रीय स्वप्न ग्रंथों पर हम आधारित हैं, वे इस विषय पर मौन हैं, इसलिए हम उनके नाम पर कोई कल्पित अर्थ नहीं जोड़ेंगे। हम केवल इतना कह सकते हैं कि स्वप्न प्रायः मन में जो चल रहा होता है उसे दर्शाते हैं, किसी निश्चित परिणाम को नहीं।',
  },
};

// =============================================================================
// PAID TEASERS — templated, curiosity-based (Rule 0: never fear-based).
// Shown on the FREE tier only, keyed by the row's paid_hook.
// =============================================================================
const PAID_TEASERS: Record<string, { en: string; hi: string }> = {
  dasha_overlay: {
    en: 'Want to see how this dream lines up with the planetary period (dasha) you are running right now? Unlock your personalised reading.',
    hi: 'जानना चाहते हैं कि यह स्वप्न आपकी वर्तमान महादशा से कैसे मेल खाता है? अपनी वैयक्तिक व्याख्या अनलॉक करें।',
  },
  kaal_sarp: {
    en: 'This snake theme can be read against Kaal Sarp yoga in your birth chart. Unlock the deeper reading.',
    hi: 'इस सर्प-विषय को आपकी कुंडली के काल सर्प योग के संदर्भ में देखा जा सकता है। गहन व्याख्या अनलॉक करें।',
  },
  pitra_dosha: {
    en: 'This ancestral signal can be checked against Pitra Dosha in your chart. Unlock the deeper reading.',
    hi: 'इस पितृ-संकेत को आपकी कुंडली के पितृ दोष के संदर्भ में देखा जा सकता है। गहन व्याख्या अनलॉक करें।',
  },
  chandra_shanti: {
    en: 'This emotional-water signal can be tied to the condition of your Moon. Unlock the deeper reading.',
    hi: 'इस भावनात्मक जल-संकेत को आपके चंद्र की स्थिति से जोड़ा जा सकता है। गहन व्याख्या अनलॉक करें।',
  },
  mangal_shanti: {
    en: 'This conflict signal can be read against Mangal (Mars) in your chart. Unlock the deeper reading.',
    hi: 'इस संघर्ष-संकेत को आपकी कुंडली के मंगल के संदर्भ में देखा जा सकता है। गहन व्याख्या अनलॉक करें।',
  },
  wealth_reading: {
    en: 'See how this wealth signal maps to your money houses and current dasha. Unlock the deeper reading.',
    hi: 'देखें कि यह धन-संकेत आपके धन-भावों और वर्तमान दशा से कैसे जुड़ता है। गहन व्याख्या अनलॉक करें।',
  },
  career_reading: {
    en: 'See how this maps to your career houses and current planetary period. Unlock the deeper reading.',
    hi: 'देखें कि यह आपके कर्म-भावों और वर्तमान दशा से कैसे जुड़ता है। गहन व्याख्या अनलॉक करें।',
  },
};

// =============================================================================
// MAIN ENTRY
// =============================================================================
export async function composeDreamReading(
  row: DreamRow,
  reading: ResolvedReading,
  tier: Tier,
  geminiCompose: GeminiComposeFn,
  dashaOverlay?: string // paid tier only; injected by Component 6 (from the VM)
): Promise<DreamReadingOutput> {
  const prompt = buildComposePrompt(row, reading, tier, dashaOverlay);

  let g: any = null;
  try {
    const raw = await geminiCompose(prompt);
    g = JSON.parse(cleanJson(raw));
  } catch {
    g = null; // Gemini misbehaved → fall back to the table's exact text (never show nothing)
  }

  const disc = assembleDisclaimers(reading.disclaimer_tags);
  const teaser = teaserFor(reading.paid_hook, tier);

  return {
    title_en: g?.title_en ?? row.symbol_en,
    title_hi: g?.title_hi ?? row.symbol_hi,
    reading_en: g?.reading_en ?? reading.meaning_en,
    reading_hi: g?.reading_hi ?? reading.meaning_hi,
    tendency: reading.effective_tendency,
    remedy_en: g?.remedy_en ?? row.remedy_free ?? '',
    remedy_hi: g?.remedy_hi ?? '',
    paid_teaser_en: teaser.en,
    paid_teaser_hi: teaser.hi,
    disclaimer_en: disc.en,
    disclaimer_hi: disc.hi,
    citation: reading.public_citation,
    signal_strength: reading.signal_strength,
    confidence_tier: reading.confidence_tier,
  };
}

// =============================================================================
// THE COMPOSITION PROMPT (English instructions; Gemini outputs bilingual JSON).
// Locked to the table meaning — no new claims allowed.
// =============================================================================
export function buildComposePrompt(
  row: DreamRow,
  reading: ResolvedReading,
  tier: Tier,
  dashaOverlay?: string
): string {
  const p: string[] = [];
  p.push(
    'You are the writer for Trikaal Vaani, a Vedic dream-reading service. Write a warm, respectful reading in BOTH Hindi and English. Preserve the given meaning EXACTLY — do not add predictions, dates, numbers, or any new astrological claim, and do not change what the dream means. Only make it warm, clear and human.'
  );
  p.push(`Symbol: ${row.symbol_en} (${row.sub_type}).`);
  p.push(`Core meaning to preserve (English): ${reading.meaning_en}`);
  p.push(`Core meaning to preserve (Hindi): ${reading.meaning_hi}`);
  p.push(`Overall leaning: ${reading.effective_tendency}.`);

  if (reading.tentative) {
    p.push(
      'Phrase this gently and non-absolutely (e.g. "this points toward", "the tradition suggests"), because the match is broad.'
    );
  }
  if (reading.prahar_note_en) {
    p.push(`Weave in this timing note naturally: ${reading.prahar_note_en}`);
  }
  if (reading.emphasize_recurrence) {
    p.push(
      'The dreamer says this dream repeats. Gently note that a recurring dream points to a deeper, ongoing theme' +
        (reading.recurrence_target ? ' that a fuller chart-based reading can explore' : '') +
        '. Do not name any technical yoga or dosha.'
    );
  }
  if (reading.graha) {
    p.push(`Associated planet (for tone only, mention lightly if it reads naturally): ${reading.graha}.`);
  }

  const remedy = row.remedy_free ?? '';
  if (remedy) {
    p.push(`Offer this simple remedy, rendered naturally into BOTH languages: "${remedy}"`);
  } else {
    p.push('No specific remedy is needed; offer a gentle general suggestion (calm prayer or quiet reflection) or omit it.');
  }

  if (tier === 'paid' && dashaOverlay) {
    p.push(
      `PERSONALISED LAYER (already computed from the user's birth chart — include it as a distinct closing paragraph and DO NOT alter its facts): ${dashaOverlay}`
    );
  }

  p.push(
    'Tone: warm, rooted, hopeful — never frightening or fear-based. Keep each language to about 3–5 sentences, plus the remedy line.'
  );
  p.push(
    'Return ONLY this JSON object, no markdown, no commentary: {"title_en":"","title_hi":"","reading_en":"","reading_hi":"","remedy_en":"","remedy_hi":""}'
  );
  return p.join('\n\n');
}

// =============================================================================
// Helpers
// =============================================================================
function assembleDisclaimers(tags: string[]): { en: string; hi: string } {
  const en = [BASE_DISCLAIMER.en];
  const hi = [BASE_DISCLAIMER.hi];
  for (const t of tags) {
    const d = TAG_DISCLAIMERS[t];
    if (d) {
      en.push(d.en);
      hi.push(d.hi);
    }
  }
  return { en: en.join(' '), hi: hi.join(' ') };
}

function teaserFor(paidHook: string, tier: Tier): { en: string; hi: string } {
  if (tier === 'paid') return { en: '', hi: '' }; // already unlocked
  return PAID_TEASERS[paidHook] ?? { en: '', hi: '' };
}

function cleanJson(s: string): string {
  return s.replace(/```json/gi, '').replace(/```/g, '').trim();
}
