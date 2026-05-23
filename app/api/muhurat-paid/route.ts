/**
 * ============================================================
 * TRIKAL VAANI — Child Birth Muhurat Paid Report — Generate API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/muhurat-paid/route.ts
 * VERSION: 1.2.1 — Added background PDF generation + strict script lock (no mid-word Roman/Devanagari mixing)
 * ============================================================
 * PIPELINE (parent's CHOSEN delivery time):
 *   VM /muhurat-paid (kundali + slot + doshas + 10 remedies)
 *     -> build 600-word child-life prediction prompt
 *     -> Gemini 2.5 Pro
 *     -> polishMuhuratNarrative() [Claude Sonnet 4.6, language-locked]
 *     -> save to muhurat_readings
 *     -> fire-and-forget VM /muhurat-pdf (generates PDF, saves pdf_url)
 *
 * Input: { slug } — slug of a PAID muhurat order's reading row.
 * The reading row already holds muhurat_data + tier + language.
 *
 * Tiers:
 *   report_101   = report + 600w prediction + boy/girl names (NO remedy detail)
 *   remedies_151 = everything + all 10 remedies
 *
 * Mirrors the proven Karmic route: idempotency cache, VM timeout, graceful errors.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { polishMuhuratNarrative, type MuhuratLanguage } from '@/lib/claude-polish';

// VM paid-muhurat endpoint (kundali + slot + doshas + 10 remedies)
const VM_MUHURAT_PAID_ENDPOINT =
  process.env.VM_MUHURAT_PAID_ENDPOINT ?? 'http://34.14.164.105:8001/muhurat-paid';

// VM PDF endpoint (generates branded PDF, uploads to Supabase, saves pdf_url)
const VM_MUHURAT_PDF_ENDPOINT =
  process.env.VM_MUHURAT_PDF_ENDPOINT ?? 'http://34.14.164.105:8001/muhurat-pdf';

// Generation config (CEO LOCKED)
const GEMINI_MODEL   = 'gemini-2.5-pro';
const GEMINI_MAX_TOK = 12000;            // MAX_TOKENS CEO locked
const WORD_TARGET    = 600;              // child-life prediction

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GEMINI_API_KEY first — GOOGLE_API_KEY is the Maps key (invalid for Gemini)
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? ''
);

interface MuhuratPaidRequest {
  slug: string;
}

// muhurat_readings.language is hinglish|hindi|english (3 options).
// VM /muhurat-paid only accepts hi|en. Map for the VM remedy call only.
function langForVM(lang: string): 'hi' | 'en' {
  return lang === 'english' ? 'en' : 'hi'; // hinglish + hindi -> hi remedies
}

// ── Fire-and-forget PDF generation on the VM ──────────────────
// Called after the narrative is saved. The VM reads the reading row
// (incl. the just-saved narrative) from Supabase, builds the PDF,
// uploads it to the muhurat-pdfs bucket, and writes pdf_url back.
// We do NOT await this — the result page shows immediately, and the
// Download PDF button appears on the next load/refresh.
function triggerMuhuratPdf(slug: string): void {
  try {
    const controller = new AbortController();
    // Generous timeout — WeasyPrint + upload can take a few seconds.
    const timeout = setTimeout(() => controller.abort(), 60000);

    fetch(VM_MUHURAT_PDF_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ slug }),
      signal:  controller.signal,
      cache:   'no-store',
    })
      .then(async (res) => {
        clearTimeout(timeout);
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          console.error('[Trikal] Muhurat PDF gen non-OK:', res.status, txt.slice(0, 200));
        } else {
          console.log('[Trikal] Muhurat PDF generation triggered OK for', slug);
        }
      })
      .catch((e) => {
        clearTimeout(timeout);
        console.error('[Trikal] Muhurat PDF gen failed (non-fatal):', e);
      });
  } catch (e) {
    // Never let PDF generation break the main report flow.
    console.error('[Trikal] Muhurat PDF trigger error (non-fatal):', e);
  }
}

function buildMuhuratPrompt(params: {
  vm: any;
  tier: string;
  language: MuhuratLanguage;
  wordTarget: number;
}): string {
  const { vm, tier, language, wordTarget } = params;

  const includeRemedies = tier === 'remedies_151';

  const slot = vm.chosen_slot ?? {};
  const remedies = Array.isArray(vm.remedies) ? vm.remedies : [];
  const doshas   = Array.isArray(vm.doshas)   ? vm.doshas   : [];

  const langInstruction =
    language === 'hindi'
      ? `Write the ENTIRE report in SHUDH HINDI using pure Devanagari script (शुद्ध हिन्दी, देवनागरी लिपि).
CRITICAL SCRIPT RULE: Every Hindi word must be written FULLY in Devanagari — never mix Roman letters
inside a Hindi word. WRONG: "viकल्प", "praकट", "suझाई". RIGHT: "विकल्प", "प्रकट", "सुझाई".
Only globally-known Vedic terms (Lagna, Nakshatra, Tithi) may stay in Roman if needed, but prefer Devanagari.`
      : language === 'english'
      ? 'Write the ENTIRE report in clear, warm ENGLISH. Keep Vedic terms (Lagna, Nakshatra, etc.) untranslated.'
      : `Write the ENTIRE report in HINGLISH — Hindi words written in ROMAN (English) letters, mixed naturally with English words.
CRITICAL SCRIPT RULE: Write Hindi words phonetically in Roman script ONLY — never use Devanagari, and never
mix Roman and Devanagari inside a single word. WRONG: "viकल्प", "praकट", "suझाई". RIGHT: "vikalp", "prakat", "sujhaai".
Every single word must be in one script only. This is modern Indian Hinglish (e.g. "Yeh ek shubh muhurat hai").`;

  return `You are Trikal — the wise Vedic soul of Trikal Vaani, by Rohiit Gupta, Chief Vedic Architect.
A pair of expecting parents have chosen an auspicious delivery muhurat (WITHIN their doctor-approved window)
for their baby. Write a warm, hopeful, blessing-filled report about the life potential of a child born
at this exact muhurat.

${langInstruction}

═══════════════════════════════════════════════════════════════
THE CHOSEN MUHURAT (use these EXACT values — never change them)
═══════════════════════════════════════════════════════════════
Chosen time: ${vm.chosen_time ?? ''}
Muhurat score: ${vm.score ?? slot.score ?? ''}/100  (band: ${vm.band ?? ''})
Lagna (ascendant): ${vm.lagna_sign ?? slot.lagna_sign ?? ''}
Lagna Nakshatra: ${vm.lagna_nakshatra ?? slot.lagna_nakshatra ?? ''}
Tithi: ${slot.tithi ?? ''}
Yoga: ${slot.yoga ?? ''}
Naamakshar (lucky name letter): ${vm.naamakshar ?? slot.naamakshar ?? ''}
Favourable factors: ${(slot.reasons ?? []).join('; ')}
Points of caution: ${(slot.cautions ?? []).join('; ')}

═══════════════════════════════════════════════════════════════
DOSHAS TO BE AWARE OF (frame gently as "be aware + remedy", never fear)
═══════════════════════════════════════════════════════════════
${doshas.length ? JSON.stringify(doshas) : 'No major doshas detected at this muhurat.'}

${includeRemedies ? `═══════════════════════════════════════════════════════════════
10 REMEDIES (include ALL of these in the remedies section — this is the Rs151 tier)
═══════════════════════════════════════════════════════════════
${JSON.stringify(remedies)}
` : `(This is the Rs101 tier — do NOT list detailed remedies. You may mention that a full
10-remedy plan is available, but do not enumerate them.)`}

═══════════════════════════════════════════════════════════════
STRUCTURE — use these EXACT section markers (keep them verbatim)
═══════════════════════════════════════════════════════════════
═══ SHUBH MUHURAT ═══
(Confirm the chosen time, score, Lagna, Nakshatra. Remind warmly that this is WITHIN the
doctor-approved window — Trikal honours medical safety first.)

═══ BACHCHE KA SWABHAV (Child's Nature & Potential) ═══
(Based on Lagna + Nakshatra, describe the child's likely temperament, strengths, gifts.
Chart INDICATIONS and potential — never guarantees.)

═══ JEEVAN KE YOG (Life Path Indications) ═══
(Education, career inclination, health vitality, relationships — as tendencies the chart favours.)

═══ NAAMAKSHAR & SHUBH NAAM (Lucky Letter & Name Suggestions) ═══
(Explain the Naamakshar "${vm.naamakshar ?? ''}". Suggest 4-5 auspicious BOY names and
4-5 auspicious GIRL names starting with this syllable.)

═══ DHYAN DENE YOGYA (Points of Awareness) ═══
(The doshas above, framed gently — awareness, not fear. ${includeRemedies ? 'Lead into remedies.' : ''})

${includeRemedies ? `═══ UPAY (10 Remedies) ═══
(List all 10 remedies clearly — 4 Parashar + 4 Bhrigu + 2 Shadbala.)
` : ''}═══ MAA SHAKTI ═══
(A short blessing for the child and parents. Maa Shakti ka ashirwad.)

═══════════════════════════════════════════════════════════════
RULES
═══════════════════════════════════════════════════════════════
- Total length around ${wordTarget} words${includeRemedies ? ' (plus the remedies)' : ''}.
- Tone: warm, hopeful, blessing. These are joyful expecting parents — never alarm them.
- Never "will definitely", "guaranteed", "100%". Always "chart indicates", "shubh yog dikhta hai".
- Never override or contradict the doctor.
- No markdown, no bullets, no "*" or "#". Pure flowing prose under each marker.
- Start directly with the first marker. No preamble.`;
}

export async function POST(req: NextRequest) {
  try {
    const body: MuhuratPaidRequest = await req.json();
    const { slug } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });
    }

    // Load the reading row (created by verify-muhurat-payment)
    const { data: reading, error: loadErr } = await supabase
      .from('muhurat_readings')
      .select('*')
      .eq('slug', slug)
      .single();

    if (loadErr || !reading) {
      console.error('[Trikal] Muhurat reading row not found:', slug, loadErr?.message);
      return NextResponse.json({ error: 'Reading not found.' }, { status: 404 });
    }

    // Idempotency: return cached narrative if already generated
    if (reading.gemini_narrative && reading.gemini_narrative.length > 200) {
      // If the narrative exists but the PDF was never made, trigger it now.
      if (!reading.pdf_url) {
        triggerMuhuratPdf(slug);
      }
      return NextResponse.json({
        success:   true,
        slug,
        tier:      reading.tier,
        language:  reading.language,
        narrative: reading.gemini_narrative,
        vmData:    reading.vm_data,
        cached:    true,
      });
    }

    // Resolve language (muhurat_readings stores hi/en, but we want 3-lang polish)
    // muhurat_orders/readings store hi|en per the table; expand: hi->hinglish default unless explicit
    const rawLang = reading.language as string;
    const language: MuhuratLanguage =
      rawLang === 'english' || rawLang === 'en' ? 'english'
      : rawLang === 'hindi' ? 'hindi'
      : rawLang === 'hinglish' ? 'hinglish'
      : 'hinglish';

    const muhuratData = reading.muhurat_data as any;
    if (!muhuratData || muhuratData.day === undefined) {
      return NextResponse.json(
        { error: 'Muhurat data incomplete. Please contact support.' },
        { status: 500 }
      );
    }

    // 1) Call VM /muhurat-paid (kundali + slot + doshas + 10 remedies)
    let vmData: any = reading.vm_data ?? null;

    if (!vmData) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      let vmRes: Response;
      try {
        vmRes = await fetch(VM_MUHURAT_PAID_ENDPOINT, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            year:      muhuratData.year,
            month:     muhuratData.month,
            day:       muhuratData.day,
            hour:      muhuratData.hour,
            minute:    muhuratData.minute,
            latitude:  muhuratData.latitude,
            longitude: muhuratData.longitude,
            timezone:  muhuratData.timezone ?? 5.5,
            lang:      langForVM(language),
          }),
          signal: controller.signal,
          cache:  'no-store',
        });
      } catch (e: unknown) {
        clearTimeout(timeout);
        console.error('[Trikal] VM /muhurat-paid fetch failed:', e);
        return NextResponse.json(
          { error: 'Muhurat engine unreachable. Please try again — your payment is safe.' },
          { status: 502 }
        );
      }
      clearTimeout(timeout);

      if (!vmRes.ok) {
        const txt = await vmRes.text().catch(() => '');
        console.error('[Trikal] VM /muhurat-paid error:', vmRes.status, txt);
        return NextResponse.json(
          { error: 'Muhurat engine returned an error. Your payment is safe; we will retry.' },
          { status: 502 }
        );
      }

      vmData = await vmRes.json();

      // Persist VM data so a retry never recomputes
      await supabase
        .from('muhurat_readings')
        .update({
          vm_data:       vmData,
          doshas_data:   vmData.doshas ?? null,
          remedies_data: vmData.remedies ?? null,
          updated_at:    new Date().toISOString(),
        })
        .eq('slug', slug);
    }

    // 2) Build the 600-word child-life prediction prompt
    const prompt = buildMuhuratPrompt({
      vm:         vmData,
      tier:       reading.tier,
      language,
      wordTarget: WORD_TARGET,
    });

    // 3) Gemini 2.5 Pro
    let geminiText = '';
    try {
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: {
          maxOutputTokens: GEMINI_MAX_TOK,
          temperature:     0.85,
          topP:            0.95,
        },
        // Iron Rule: never set thinkingBudget:0
      });

      const result = await model.generateContent(prompt);
      geminiText   = result.response.text();

      if (!geminiText || geminiText.length < 300) {
        throw new Error('Gemini returned empty or too-short response.');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown Gemini error';
      console.error('[Trikal] Muhurat Gemini error:', msg);
      return NextResponse.json(
        { error: 'Report engine failed. Please refresh — your payment is safe and we will retry.' },
        { status: 502 }
      );
    }

    // 4) Claude Sonnet 4.6 polish (tone-locked, language-locked)
    let finalText = geminiText;
    let didPolish = false;
    let polishMs  = 0;

    const polishResult = await polishMuhuratNarrative({
      rawNarrative: geminiText,
      language,
    });

    finalText = polishResult.narrative;
    didPolish = polishResult.polished;
    polishMs  = polishResult.polishMs ?? 0;

    if (!polishResult.polished && polishResult.error) {
      console.warn('[Trikal] Muhurat polish skipped:', polishResult.error);
    }

    // 5) Extract a GEO answer (first non-marker line) for the page
    const geoAnswer = finalText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .find((l) => !l.startsWith('═══')) ?? '';

    // 6) Save
    const { error: saveErr } = await supabase
      .from('muhurat_readings')
      .update({
        gemini_narrative: finalText,
        geo_answer:       geoAnswer.slice(0, 400),
        updated_at:       new Date().toISOString(),
      })
      .eq('slug', slug);

    if (saveErr) {
      console.error('[Trikal] Muhurat narrative save failed:', saveErr.message);
    }

    // 7) Fire-and-forget PDF generation (non-blocking).
    //    The narrative is now saved, so the VM PDF engine will include it.
    //    The Download PDF button appears once pdf_url is written (next load).
    triggerMuhuratPdf(slug);

    return NextResponse.json({
      success:   true,
      slug,
      tier:      reading.tier,
      language,
      narrative: finalText,
      vmData,
      cached:    false,
      polished:  didPolish,
      polishMs,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Trikal] /api/muhurat-paid error:', msg);
    return NextResponse.json(
      { error: 'Server error generating report.' },
      { status: 500 }
    );
  }
}
