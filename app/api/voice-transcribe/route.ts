/**
 * ============================================================
 * TRIKAL VAANI — Voice Transcription API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-transcribe/route.ts
 * VERSION: 4.0 (18 Sep 2026) — gpt-4o-transcribe → gpt-transcribe
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * WHY
 *   OpenAI released `gpt-transcribe` on 28 July 2026. Their File transcription
 *   guide now opens with "Start with gpt-transcribe" and lists gpt-4o-transcribe
 *   among models that "aren't the recommended starting models for a new
 *   transcription integration". It also accepts `languages[]` (several language
 *   hints at once, for code-switching) and `keywords[]` (literal terms to
 *   expect) — neither of which the old model takes.
 *
 * WHAT CHANGED FROM v3.0 — deliberately small
 *   1. model: gpt-4o-transcribe → gpt-transcribe.
 *   2. languages[]: ['hi','en'] declared together. This is the Hinglish case.
 *   3. keywords[]: NAMES ONLY (see the safety rule below).
 *   The prompt text and the fallback are v3.0's, UNCHANGED. v3.0's prompt was
 *   tuned against real user audio; rewriting it in the same commit as a model
 *   swap would make a bad result impossible to attribute.
 *
 * THE KEYWORD SAFETY RULE — the important part of this file
 *   Keywords are hints. OpenAI warns they can make the model emit terms nobody
 *   said. For an astrology product that splits into two very different risks:
 *     - a NAME transcribed wrong  → ugly transcript, same reading
 *     - a DOSH invented           → WRONG READING sent to a paying customer
 *   So this list carries grah, dasha and chart-structure names only. No dosh,
 *   no Sade Sati, no Kaal Sarp, no diagnostic verdict of any kind. Those must
 *   reach the transcript because the caller actually said them.
 *   DO NOT ADD DIAGNOSTIC TERMS TO THIS LIST.
 *
 *   Kill switch: set USE_KEYWORDS to false. The model upgrade and the language
 *   hints survive; only the keyword hinting stops. Use this first if
 *   transcripts start showing words nobody spoke.
 *
 * HONEST CAVEAT — READ BEFORE TRUSTING THIS
 *   No audio has been put through this file. The model id, the endpoint and the
 *   multipart field names `keywords[]` / `languages[]` come from OpenAI's own
 *   guide, read 18 Sep 2026, and have NOT been confirmed by a live call from
 *   this codebase. If the shape is wrong, OpenAI returns an error and the code
 *   below falls through to gpt-4o-mini-transcribe — the product keeps speaking,
 *   it just runs on the old model. Check the logs after deploying.
 *   The "25% cheaper" figure ($0.0045 vs $0.006 per minute) is from a
 *   third-party summary, not from OpenAI's pricing page.
 *
 * ENV REQUIRED
 *   OPENAI_API_KEY (from platform.openai.com)
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

const STT_MODEL          = 'gpt-transcribe';
const STT_FALLBACK_MODEL = 'gpt-4o-mini-transcribe';
const STT_URL            = 'https://api.openai.com/v1/audio/transcriptions';

/** Kill switch — see THE KEYWORD SAFETY RULE above. */
const USE_KEYWORDS = true;

// v3.0's prompt, word for word. Tuned on real user audio. Do not rewrite it in
// the same change as a model swap.
const TRANSCRIPTION_PROMPT = `Hinglish speech — Hindi and English mixed naturally. 
Speaker may be emotional, crying, speaking softly or in distress. 
Astrology topics: kundali, Mahadasha, Antardasha, Vimshottari, Shani, Rahu, Ketu, Guru, Shukra, Mangal, Budh, Surya, Chandra, lagna, rashi, nakshatra, dosha, upay, remedies.
Life topics: bimari, shaadi, career, naukri, business, paisa, beta, beti, family.
Transcribe every word accurately even if speaker is crying or whispering.`;

// NAMES ONLY. Read the safety rule in the header before touching this.
const TRANSCRIPTION_KEYWORDS = [
  // grah — proper nouns, the things ASR mangles most
  'Shani', 'Rahu', 'Ketu', 'Guru', 'Shukra', 'Mangal', 'Budh', 'Surya', 'Chandra',
  // chart structure
  'kundali', 'lagna', 'rashi', 'nakshatra', 'gochar',
  // dasha system names
  'Mahadasha', 'Antardasha', 'Vimshottari',
];

// Hindi and English together — this is the code-switching case.
const TRANSCRIPTION_LANGUAGES = ['hi', 'en'];

/** OpenAI rejects the WHOLE request if a keyword carries one of these. */
function safeKeyword(k: string): boolean {
  return !/[<>\r\n]/.test(k) && k.trim().length > 0;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[Trikal STT v4.0] OPENAI_API_KEY missing');
      return NextResponse.json({ error: 'Voice service not configured' }, { status: 500 });
    }

    const formData  = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const sessionId = formData.get('sessionId') as string | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file' }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: 'Session required' }, { status: 401 });
    }
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio too large (max 25MB)' }, { status: 413 });
    }
    if (audioFile.size < 500) {
      return NextResponse.json(
        { error: 'Recording too short — please speak for at least 3 seconds' },
        { status: 400 }
      );
    }

    console.log('[Trikal STT v4.0] Audio received:', {
      size: audioFile.size,
      type: audioFile.type,
    });

    // ── Build multipart form for OpenAI ─────────────────────
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob   = new Blob([audioBuffer], { type: audioFile.type || 'audio/webm' });

    // OpenAI requires a filename with extension
    const ext      = audioFile.type?.includes('mp4') ? 'mp4'
                   : audioFile.type?.includes('ogg') ? 'ogg'
                   : audioFile.type?.includes('wav') ? 'wav'
                   : 'webm';
    const filename = `voice.${ext}`;

    const openAIForm = new FormData();
    openAIForm.append('file',   audioBlob, filename);
    openAIForm.append('model',  STT_MODEL);
    openAIForm.append('prompt', TRANSCRIPTION_PROMPT);

    // Repeated bracketed fields — the multipart shape OpenAI documents.
    if (USE_KEYWORDS) {
      for (const k of TRANSCRIPTION_KEYWORDS.filter(safeKeyword)) {
        openAIForm.append('keywords[]', k);
      }
    }
    // NOTE: `languages` REPLACES the singular `language`. Never send both —
    // OpenAI rejects a request carrying the pair.
    for (const l of TRANSCRIPTION_LANGUAGES) {
      openAIForm.append('languages[]', l);
    }

    // ── Call OpenAI transcription API ────────────────────────
    const sttRes = await fetch(STT_URL, {
      method : 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body   : openAIForm,
    });

    if (!sttRes.ok) {
      const errText = await sttRes.text();
      // Logged in full-ish on purpose: if the multipart shape above is wrong,
      // THIS is the line that will say so.
      console.error('[Trikal STT v4.0] OpenAI error:', sttRes.status, errText.substring(0, 300));

      // ── Fallback: gpt-4o-mini-transcribe ─────────────────
      // v3.0's fallback, unchanged. Different model family on purpose, so a bad
      // day for the new model does not take the product down with it.
      console.log('[Trikal STT v4.0] Trying fallback:', STT_FALLBACK_MODEL);
      const fallbackForm = new FormData();
      fallbackForm.append('file',   audioBlob, filename);
      fallbackForm.append('model',  STT_FALLBACK_MODEL);
      fallbackForm.append('prompt', TRANSCRIPTION_PROMPT);

      const fallbackRes = await fetch(STT_URL, {
        method : 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body   : fallbackForm,
      });

      if (!fallbackRes.ok) {
        const fallbackErr = await fallbackRes.text();
        console.error('[Trikal STT v4.0] Fallback also failed:', fallbackErr.substring(0, 300));
        return NextResponse.json({ error: 'Voice recognition failed' }, { status: 500 });
      }

      const fallbackData  = await fallbackRes.json();
      const transcription = fallbackData.text?.trim() || '';
      if (!transcription) {
        return NextResponse.json(
          { error: 'Could not understand audio. Please speak clearly.' },
          { status: 422 }
        );
      }

      console.log('[Trikal STT v4.0] Fallback success:', transcription.substring(0, 80));
      return NextResponse.json({
        success      : true,
        transcription,
        model        : STT_FALLBACK_MODEL,
        wordCount    : transcription.split(/\s+/).length,
      });
    }

    const sttData       = await sttRes.json();
    const transcription = sttData.text?.trim() || '';

    if (!transcription) {
      console.warn('[Trikal STT v4.0] Empty transcription');
      return NextResponse.json(
        { error: 'Could not understand audio. Please speak clearly and try again.' },
        { status: 422 }
      );
    }

    // gpt-transcribe reports the languages it heard; an empty array means it
    // could not call it reliably. Worth watching: if this is almost always
    // ['hi'], the English hint is costing nothing but also doing nothing.
    const detected: string[] = Array.isArray(sttData.languages)
      ? sttData.languages.map((l: { code?: string }) => l?.code).filter(Boolean)
      : [];

    console.log('[Trikal STT v4.0] Transcribed:', {
      detected,
      keywords: USE_KEYWORDS,
      preview : transcription.substring(0, 100),
    });

    return NextResponse.json({
      success      : true,
      transcription,
      model        : STT_MODEL,
      detectedLangs: detected,
      wordCount    : transcription.split(/\s+/).length,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Trikal STT v4.0] Fatal:', message);
    return NextResponse.json({ error: 'Voice transcription failed', detail: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status  : 'Trikaal Voice STT API is live',
    version : '4.0',
    model   : STT_MODEL,
    keywords: USE_KEYWORDS,
    quality : 'Hinglish code-switching, name-only keyword hints',
    fallback: STT_FALLBACK_MODEL,
  });
}
