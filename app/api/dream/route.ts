// =============================================================================
// TRIKAAL VAANI · Dream Engine · Component 5b: THE API ROUTE
// File: app/api/dream/route.ts
// -----------------------------------------------------------------------------
// The live endpoint your /swapna page calls. It assembles all the pieces:
//   dream in → extract (Flash) → resolve (table) → tune (Layer 3) →
//   compose (Flash free / Pro paid) → reading out.
//
// The FREE path is fully live here. The PAID chart overlay is a marked
// Component 6 placeholder (wired next via lib/callVM.ts) so nothing blocks.
// Uses your existing Supabase client (@/lib/supabase). Never touches your
// prediction path.
// =============================================================================

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { resolveDream } from '@/lib/dream/dream_engine_02_resolver';
import { applyModifiers } from '@/lib/dream/dream_engine_03_modifiers';
import { composeDreamReading, SAFE_MESSAGES } from '@/lib/dream/dream_engine_04_composer';
import { runExtraction, makeSubTypePicker, makeComposer } from '@/lib/dream/dream_engine_05a_gemini';

export const runtime = 'nodejs'; // the Gemini SDK needs the Node runtime

const MAX_DREAM_CHARS = 280; // frontend limits to 250; small buffer here

// What the ₹51 unlock gives — shown on the free-tier upsell card
const PAID_UNLOCKS_EN = [
  'This dream read against your running planetary period (Mahadasha–Antardasha)',
  'Whether it ties to a yoga or dosha in YOUR birth chart',
  'The exact life-area it points to — career, wealth, marriage',
  'A remedy personalised to your chart, not a generic one',
  'A deeper, 500-word reading written for your situation',
];
const PAID_UNLOCKS_HI = [
  'यह स्वप्न आपकी चल रही महादशा–अंतर्दशा के संदर्भ में',
  'क्या यह आपकी कुंडली के किसी योग या दोष से जुड़ा है',
  'यह किस जीवन-क्षेत्र की ओर संकेत करता है — करियर, धन, विवाह',
  'आपकी कुंडली के अनुसार वैयक्तिक उपाय, सामान्य नहीं',
  'आपकी स्थिति के लिए लिखी गई गहन 500-शब्द व्याख्या',
];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const dream: string = (body?.dream ?? '').toString().trim();
    const tier: 'free' | 'paid' = body?.tier === 'paid' ? 'paid' : 'free';
    const birth = body?.birth ?? null; // used by the paid overlay (Component 6)

    if (!dream) {
      return NextResponse.json({ ok: false, error: 'Please describe your dream.' }, { status: 400 });
    }
    if (dream.length > MAX_DREAM_CHARS) {
      return NextResponse.json({ ok: false, error: 'Please keep your dream under 250 characters.' }, { status: 400 });
    }

    // 1) Extract signals (Flash, deterministic)
    const extraction = await runExtraction(dream);

    // 2) Resolve to a real table row (Supabase)
    const resolved = await resolveDream(extraction, supabase, makeSubTypePicker());

    // --- Rule 0 terminal cases (never reach the composer) ---
    if (resolved.status === 'refuse_minor') {
      const m = SAFE_MESSAGES.refuse_minor;
      return NextResponse.json({
        ok: true, status: 'refused',
        title_en: m.title_en, title_hi: m.title_hi,
        reading_en: m.body_en, reading_hi: m.body_hi,
      });
    }
    if (resolved.status === 'gender_silent') {
      const m = SAFE_MESSAGES.gender_silent;
      return NextResponse.json({
        ok: true, status: 'silent',
        title_en: m.title_en, title_hi: m.title_hi,
        reading_en: m.body_en, reading_hi: m.body_hi,
      });
    }
    if (resolved.status === 'no_match') {
      return NextResponse.json({
        ok: true, status: 'no_match',
        title_en: 'Tell me a little more',
        title_hi: 'थोड़ा और बताइए',
        reading_en: 'We could not place this dream clearly. Try naming the main object or the main feeling in a few words.',
        reading_hi: 'हम इस स्वप्न को स्पष्ट रूप से पहचान नहीं पाए। मुख्य वस्तु या मुख्य भाव को कुछ शब्दों में बताइए।',
      });
    }

    const { row, matchLevel } = resolved;

    // 3) Layer-3 modifiers (feeling-flip, timing, recurrence)
    const reading = applyModifiers(row, extraction, matchLevel);

    // 4) Paid chart overlay — Component 6 (via the VM). Free tier: undefined.
    let dashaOverlay: string | undefined;
    if (tier === 'paid') {
      dashaOverlay = await computeDashaOverlay(birth);
    }

    // 5) Compose the reading (Flash free / Pro paid)
    const out = await composeDreamReading(row, reading, tier, makeComposer(tier), dashaOverlay);

    // 6) Response shaped for the sales frontend
    return NextResponse.json({
      ok: true,
      status: 'reading',
      symbol_key: row.symbol_key,     // → big symbol illustration
      category: row.category,
      title_en: out.title_en,
      title_hi: out.title_hi,
      reading_en: out.reading_en,
      reading_hi: out.reading_hi,
      tendency: out.tendency,         // → auspicious / inauspicious / balanced badge
      signal_strength: out.signal_strength,
      remedy_en: out.remedy_en,
      remedy_hi: out.remedy_hi,
      citation: out.citation,         // → trust / source line
      disclaimer_en: out.disclaimer_en,
      disclaimer_hi: out.disclaimer_hi,
      // Upsell block — present on the free tier only
      paid: tier === 'free'
        ? {
            price: 51,
            teaser_en: out.paid_teaser_en,
            teaser_hi: out.paid_teaser_hi,
            unlocks_en: PAID_UNLOCKS_EN,
            unlocks_hi: PAID_UNLOCKS_HI,
          }
        : null,
    });
  } catch (err) {
    console.error('[dream] route error:', err);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong reading your dream. Please try again.' },
      { status: 500 }
    );
  }
}

// =============================================================================
// COMPONENT 6 PLACEHOLDER — paid dasha/gochar overlay via the VM chart engine.
// Wired next using lib/callVM.ts (Swiss Ephemeris → running dasha + any yoga/
// dosha tied to the symbol → a short factual paragraph the composer includes).
// Returns undefined for now, so the paid path still returns a Pro-written
// reading until the overlay is connected.
// =============================================================================
async function computeDashaOverlay(_birth: unknown): Promise<string | undefined> {
  return undefined;
}
