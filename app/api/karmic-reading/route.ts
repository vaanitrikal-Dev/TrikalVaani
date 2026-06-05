/**
 * ============================================================
 * TRIKAL VAANI — Karmic Background Reading — Generate API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/karmic-reading/route.ts
 * VERSION: 1.2
 * SIGNED: ROHIIT GUPTA, CEO
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
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildKarmicReadingPrompt } from '@/lib/karmic-reading-prompt';
import { polishKarmicNarrative }    from '@/lib/claude-polish';
import { callVM }                   from '@/lib/callVM';

const VM_KUNDALI_ENDPOINT =
  process.env.VM_KUNDALI_ENDPOINT ?? 'http://34.47.182.227:8001/kundali';

const GEMINI_MODEL   = 'gemini-2.5-pro';
const GEMINI_MAX_TOK = 12000;
const WORD_TARGET    = 1000;   // v1.1: was 1600, cut to ~90s generation

type Language = 'hinglish' | 'hindi' | 'english';
const VALID_LANGUAGES: Language[] = ['hinglish', 'hindi', 'english'];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? ''
);

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

    // 3) Gemini 2.5 Pro
    let geminiText = '';
    try {
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: { maxOutputTokens: GEMINI_MAX_TOK, temperature: 0.85, topP: 0.95 },
      });
      const result = await model.generateContent(prompt);
      geminiText = result.response.text();
      if (!geminiText || geminiText.length < 300) throw new Error('Empty Gemini response');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown';
      console.error('[Trikal] Karmic Gemini error:', msg);
      return NextResponse.json(
        { error: 'Reading engine failed. Refresh to retry — your payment is safe.' },
        { status: 502 }
      );
    }

    // 4) Claude Sonnet 4.6 polish
    const polishResult = await polishKarmicNarrative({ rawNarrative: geminiText, language });
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
