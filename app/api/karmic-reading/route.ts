/**
 * ============================================================
 * TRIKAL VAANI — Karmic Background Reading — Generate API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/karmic-reading/route.ts
 * VERSION: 1.4 (29 Sep 2026) — Surakshit 1-tap email + ai-fallback v1.1 (Claude 70s reserve)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * CHANGE v1.3 (29 Sep 2026) — AI FALLBACK (CEO: "pehle sab pe laga do"):
 *   Pehle sirf EK Gemini call thi — Google 503 ("high demand", 27-29 Sep
 *   baar-baar) aate hi ₹251 customer ko "Reading engine failed". Ab
 *   lib/ai-fallback.ts: gemini-3.8-flash → gemini-3.7-flash (bheed par
 *   ek retry) → Claude Sonnet 5. Claude ne likha ho to alag Claude polish
 *   skip (dobara Claude ka time/kharcha nahi). maxDuration 300 explicit.
 *   Prompt, word target, save, GEO answer — sab v1.2 jaisa.
 * ============================================================
 * CHANGE v1.2:
 *   VM call now routes through lib/callVM.ts so the X-Trikal-Key
 *   auth header is injected automatically. Timeout/abort logic
 *   and all other behaviour are byte-for-byte identical to v1.1.
 * CHANGE v1.1:
 *   WORD_TARGET 1600 → 1000 (cuts generation from ~3.5min to ~90s).
 *   6 dims still deeply personal — ~167w per dimension.
 *   All other logic identical to v1.0.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateWithFallback }     from '@/lib/ai-fallback';
import { notifyReportReady }        from '@/lib/report-notify';
import { buildKarmicReadingPrompt } from '@/lib/karmic-reading-prompt';
import { polishKarmicNarrative }    from '@/lib/claude-polish';
import { callVM }                   from '@/lib/callVM';

const VM_KUNDALI_ENDPOINT =
  process.env.VM_KUNDALI_ENDPOINT ?? 'http://34.47.182.227:8001/kundali';

// MIGRATED 3 Sep 2026 — gemini-2.5-flash and gemini-2.5-pro SHUT DOWN ON
// 16 OCTOBER 2026. Mapping approved by Rohiit: 2.5-flash -> 3.7-flash,
// 2.5-pro -> 3.8-flash. On the independent Artificial Analysis index
// 3.8 Flash scores 59 and 3.7 Flash 56, against Gemini 3.1 Pro's
// upper-40s — an upgrade in capability, and cheaper than 2.5-pro was.
// This is the Rs 251 Karmic reading, the deepest product on the site. It
// was on 2.5-pro, so 3.8-flash is the mapping — and on every published
// benchmark it is the stronger model, not a downgrade to save money.
const GEMINI_MODEL   = 'gemini-3.8-flash';
const GEMINI_MAX_TOK = 12000;
const WORD_TARGET    = 1000;   // v1.1: was 1600, cut to ~90s generation

type Language = 'hinglish' | 'hindi' | 'english';
const VALID_LANGUAGES: Language[] = ['hinglish', 'hindi', 'english'];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const maxDuration = 300; // v1.3.1: VM ~25s + AI chain ≤170s (Claude likhe to polish nahi) / Gemini ≤100s + polish ≤120s

interface KarmicRequest { slug: string }

interface PersonData {
  name:       string;
  dob:        string;
  tob:        string;
  lat?:       number;
  latitude?:  number;
  lng?:       number;
  longitude?: number;
  timezone:   number;
  cityName?:  string;
  place?:     string;
}

function buildKundaliPayload(p: PersonData) {
  return {
    year:      Number(p.dob.slice(0, 4)),
    month:     Number(p.dob.slice(5, 7)),
    day:       Number(p.dob.slice(8, 10)),
    hour:      Number(p.tob.slice(0, 2)),
    minute:    Number(p.tob.slice(3, 5)),
    latitude:  (p.latitude  ?? p.lat)  as number,
    longitude: (p.longitude ?? p.lng)  as number,
    timezone:  p.timezone,
    place:     p.place ?? p.cityName ?? '',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: KarmicRequest = await req.json();
    const { slug } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });
    }

    const { data: reading, error: loadErr } = await supabase
      .from('karmic_readings')
      .select('*')
      .eq('slug', slug)
      .single();

    if (loadErr || !reading) {
      return NextResponse.json({ error: 'Reading not found.' }, { status: 404 });
    }

    // Idempotency
    if (reading.gemini_narrative && reading.gemini_narrative.length > 200) {
      return NextResponse.json({
        success: true, slug, language: reading.language,
        narrative: reading.gemini_narrative, cached: true,
      });
    }

    const language: Language = VALID_LANGUAGES.includes(reading.language as Language)
      ? (reading.language as Language) : 'hinglish';

    const person = reading.person_data as PersonData;
    if (!person?.dob || !person?.tob) {
      return NextResponse.json({ error: 'Reading data incomplete.' }, { status: 500 });
    }

    // 1) VM /kundali — use cached chart if available
    let kundaliData: unknown = reading.kundali_data ?? null;
    if (!kundaliData) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      let vmRes: Response;
      try {
        vmRes = await callVM(VM_KUNDALI_ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(buildKundaliPayload(person)),
          signal: controller.signal,
        });
      } catch (e) {
        clearTimeout(timeout);
        return NextResponse.json(
          { error: 'Chart engine unreachable. Your payment is safe — please refresh.' },
          { status: 502 }
        );
      }
      clearTimeout(timeout);
      if (!vmRes.ok) {
        return NextResponse.json(
          { error: 'Chart engine error. Your payment is safe.' }, { status: 502 }
        );
      }
      kundaliData = await vmRes.json();
      await supabase.from('karmic_readings')
        .update({ kundali_data: kundaliData, updated_at: new Date().toISOString() })
        .eq('slug', slug);
    }

    // 2) Prompt
    const prompt = buildKarmicReadingPrompt({
      person_name:  person.name ?? 'This person',
      person_place: person.place ?? person.cityName ?? '',
      kundali_data: kundaliData,
      word_target:  WORD_TARGET,
      language,
    });

    // 3) v1.3: Gemini 3.8 → 3.7 → Claude Sonnet 5 (lib/ai-fallback.ts)
    let geminiText = '';
    let writtenByClaude = false;
    try {
      const ai = await generateWithFallback({
        tag: 'karmic',
        prompt,
        models: [GEMINI_MODEL, 'gemini-3.7-flash'],
        maxOutputTokens: GEMINI_MAX_TOK,
        temperature: 0.85,
        topP: 0.95,
        perCallTimeoutMs: 100_000,
        deadlineMs: Date.now() + 170_000,
        claudeMaxTokens: 8000,
        claudeMinMs: 60_000,
        claudeReserveMs: 70_000,
        minChars: 300,
      });
      geminiText = ai.text;
      writtenByClaude = ai.fallback;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown';
      console.error('[Trikal] Karmic Gemini error:', msg);
      return NextResponse.json(
        { error: 'Reading engine failed. Refresh to retry — your payment is safe.' },
        { status: 502 }
      );
    }

    // 4) Claude Sonnet 4.6 polish (v1.3: skip if Claude already wrote it)
    const polishResult = writtenByClaude
      ? { narrative: geminiText, polished: false, error: undefined as string | undefined }
      : await polishKarmicNarrative({ rawNarrative: geminiText, language });
    const finalText = polishResult.narrative;
    if (!polishResult.polished && polishResult.error) {
      console.warn('[Trikal] Karmic polish skipped:', polishResult.error);
    }

    // 5) GEO answer (first non-marker line)
    const geoAnswer = finalText.split('\n').map(l => l.trim())
      .filter(Boolean).find(l => !l.startsWith('═══')) ?? '';

    // 6) Save
    await supabase.from('karmic_readings')
      .update({
        gemini_narrative: finalText,
        geo_answer: geoAnswer.slice(0, 400),
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug);

    // v1.4 — Surakshit 1-tap: CEO ko WhatsApp-button email (never throws)
    await notifyReportReady({
      product:    'Karmic Reading',
      reportUrl:  `https://trikalvaani.com/karmic/${slug}`,
      orderTable: 'karmic_orders',
      orderId:    reading.order_id ?? null,
    });

    return NextResponse.json({
      success: true, slug, language, narrative: finalText,
      cached: false, polished: polishResult.polished,
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown';
    console.error('[Trikal] /api/karmic-reading error:', msg);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
