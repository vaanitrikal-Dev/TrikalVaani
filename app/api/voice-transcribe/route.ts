/**
 * ============================================================
 * TRIKAL VAANI — Voice Transcription API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-transcribe/route.ts
 * VERSION: 3.0 — OpenAI gpt-4o-transcribe (world's best for emotional speech)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v3.0 CHANGES (May 11, 2026):
 *   - UPGRADED: Google STT → OpenAI gpt-4o-transcribe
 *   - WER: 2.46% (Google was ~10-12% for Hinglish)
 *   - HANDLES: Crying, sobbing, whispers, soft voice, shy users
 *   - HANDLES: Hindi + English mixed naturally
 *   - COST: ~₹0.52/prediction — CEO approved
 *   - FALLBACK: gpt-4o-mini-transcribe if primary fails
 *
 * ENV REQUIRED:
 *   OPENAI_API_KEY (from platform.openai.com)
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Context prompt dramatically improves accuracy for emotional/soft speakers
// Tells the model what kind of speech and vocabulary to expect
const TRANSCRIPTION_PROMPT = `Hinglish speech — Hindi and English mixed naturally. 
Speaker may be emotional, crying, speaking softly or in distress. 
Astrology topics: kundali, Mahadasha, Antardasha, Vimshottari, Shani, Rahu, Ketu, Guru, Shukra, Mangal, Budh, Surya, Chandra, lagna, rashi, nakshatra, dosha, upay, remedies.
Life topics: bimari, shaadi, career, naukri, business, paisa, beta, beti, family.
Transcribe every word accurately even if speaker is crying or whispering.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[Trikal STT v3.0] OPENAI_API_KEY missing');
      return NextResponse.json({ error: 'Voice service not configured' }, { status: 500 });
    }

    const formData = await req.formData();
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

    console.log('[Trikal STT v3.0] Audio received:', {
      size: audioFile.size,
      type: audioFile.type,
    });

    // ── Build multipart form for OpenAI ─────────────────────
    const openAIForm = new FormData();

    // Convert File to Blob with correct name for OpenAI
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBlob   = new Blob([audioBuffer], { type: audioFile.type || 'audio/webm' });

    // OpenAI requires a filename with extension
    const ext      = audioFile.type?.includes('mp4') ? 'mp4'
                   : audioFile.type?.includes('ogg') ? 'ogg'
                   : audioFile.type?.includes('wav') ? 'wav'
                   : 'webm';
    const filename = `voice.${ext}`;

    openAIForm.append('file',   audioBlob, filename);
    openAIForm.append('model',  'gpt-4o-transcribe');
    openAIForm.append('prompt', TRANSCRIPTION_PROMPT);

    // ── Call OpenAI transcription API ────────────────────────
    const sttRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method : 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body   : openAIForm,
    });

    if (!sttRes.ok) {
      const errText = await sttRes.text();
      console.error('[Trikal STT v3.0] OpenAI error:', sttRes.status, errText.substring(0, 200));

      // ── Fallback: gpt-4o-mini-transcribe ─────────────────
      console.log('[Trikal STT v3.0] Trying fallback: gpt-4o-mini-transcribe');
      const fallbackForm = new FormData();
      fallbackForm.append('file',   audioBlob, filename);
      fallbackForm.append('model',  'gpt-4o-mini-transcribe');
      fallbackForm.append('prompt', TRANSCRIPTION_PROMPT);

      const fallbackRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method : 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body   : fallbackForm,
      });

      if (!fallbackRes.ok) {
        const fallbackErr = await fallbackRes.text();
        console.error('[Trikal STT v3.0] Fallback also failed:', fallbackErr.substring(0, 200));
        return NextResponse.json({ error: 'Voice recognition failed' }, { status: 500 });
      }

      const fallbackData = await fallbackRes.json();
      const transcription = fallbackData.text?.trim() || '';
      if (!transcription) {
        return NextResponse.json(
          { error: 'Could not understand audio. Please speak clearly.' },
          { status: 422 }
        );
      }

      console.log('[Trikal STT v3.0] Fallback success:', transcription.substring(0, 80));
      return NextResponse.json({
        success      : true,
        transcription,
        model        : 'gpt-4o-mini-transcribe',
        wordCount    : transcription.split(/\s+/).length,
      });
    }

    const sttData = await sttRes.json();
    const transcription = sttData.text?.trim() || '';

    if (!transcription) {
      console.warn('[Trikal STT v3.0] Empty transcription');
      return NextResponse.json(
        { error: 'Could not understand audio. Please speak clearly and try again.' },
        { status: 422 }
      );
    }

    console.log('[Trikal STT v3.0] Transcribed:', transcription.substring(0, 100));

    return NextResponse.json({
      success      : true,
      transcription,
      model        : 'gpt-4o-transcribe',
      wordCount    : transcription.split(/\s+/).length,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Trikal STT v3.0] Fatal:', message);
    return NextResponse.json({ error: 'Voice transcription failed', detail: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status  : 'Trikal Voice STT API is live',
    version : '3.0',
    model   : 'gpt-4o-transcribe',
    quality : 'World best — handles crying, soft voice, Hinglish',
    fallback: 'gpt-4o-mini-transcribe',
  });
}
