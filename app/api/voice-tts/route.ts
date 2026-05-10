/**
 * ============================================================
 * TRIKAL VAANI — Voice TTS API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-tts/route.ts
 * VERSION: 4.1 — Gemini-TTS for ALL tiers (CEO quality mandate)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v4.0 CHANGES (May 10, 2026):
 *   - CEO MANDATE: Quality over cost — Gemini-TTS for everyone
 *   - ALL packs (p11/p51/p101) now use Gemini-TTS Charon voice
 *   - REASON: Wavenet-D sounds robotic at slow speed
 *   - Gemini-TTS uses natural language style prompt for guru tone
 *   - Fallback: Neural2-D (better than Wavenet) if Gemini-TTS fails
 *   - Cost: ~₹1/prediction — CEO approved
 *
 * VOICE PERSONALITY:
 *   "Ancient wisdom + modern AI"
 *   Calm astrologer, NOT call-center bot
 *   Slow deliberate pace, lower authoritative pitch
 *   Charon voice = deep, composed, trustworthy
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60; // CACHE-BUST-v4.1

const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const GEMINI_TTS_VOICE = 'Charon';  // Deep authoritative male

// Neural2-D fallback — much better than Wavenet-D
const FALLBACK_VOICE   = 'hi-IN-Neural2-D';

// ── Style prompt for guru persona ─────────────────────────────
const GURU_STYLE_PROMPT = `Speak as a calm, deeply wise Vedic astrologer in his late 50s — composed, unhurried, authoritative. 
NOT a customer support bot. NOT a YouTube narrator. NOT energetic or upbeat.
Use slow, deliberate pacing with natural pauses between insights.
Slightly lower your pitch for gravitas and trust.
Pronounce Sanskrit and Hindi words (Shani, Rahu, Ketu, Mahadasha, Antardasha, Pancham bhav) with respectful clarity.
Sound like an ancient wisdom keeper who has spent decades studying the stars.
This is a spiritual consultation — treat it with reverence.

Now read this prediction:`;

// ─────────────────────────────────────────────────────────────
// Gemini-TTS synthesis (Primary — all tiers)
// ─────────────────────────────────────────────────────────────
async function synthesizeGeminiTTS(text: string): Promise<{ buffer: Buffer; mime: string } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[Trikal TTS v4.0] GEMINI_API_KEY missing');
    return null;
  }

  const fullPrompt = `${GURU_STYLE_PROMPT}\n\n${text}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${apiKey}`,
    {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: GEMINI_TTS_VOICE },
            },
          },
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('[Trikal TTS v4.0] Gemini-TTS error:', res.status, err.substring(0, 200));
    return null;
  }

  const data = await res.json();
  const audioBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

  if (!audioBase64) {
    console.error('[Trikal TTS v4.0] No audio in Gemini response');
    return null;
  }

  // Gemini returns PCM 16-bit 24kHz — wrap in WAV for browser playback
  const pcmBuffer = Buffer.from(audioBase64, 'base64');
  const wavBuffer = wrapPcmInWav(pcmBuffer, 24000);

  console.log('[Trikal TTS v4.0] Gemini-TTS success:', wavBuffer.length, 'bytes');
  return { buffer: wavBuffer, mime: 'audio/wav' };
}

// ─────────────────────────────────────────────────────────────
// Neural2-D fallback (better than Wavenet)
// ─────────────────────────────────────────────────────────────
async function synthesizeNeural2(text: string): Promise<{ buffer: Buffer; mime: string } | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        input: { text },
        voice: { languageCode: 'hi-IN', name: FALLBACK_VOICE },
        audioConfig: {
          audioEncoding   : 'MP3',
          speakingRate    : 0.80,
          pitch           : -3.0,
          sampleRateHertz : 24000,
          effectsProfileId: ['headphone-class-device'],
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('[Trikal TTS v4.0] Neural2 fallback failed:', res.status, err.substring(0, 150));
    return null;
  }

  const data = await res.json();
  if (!data.audioContent) return null;

  const buffer = Buffer.from(data.audioContent, 'base64');
  console.log('[Trikal TTS v4.0] Neural2 fallback success:', buffer.length, 'bytes');
  return { buffer, mime: 'audio/mpeg' };
}

// ─────────────────────────────────────────────────────────────
// PCM → WAV wrapper
// ─────────────────────────────────────────────────────────────
function wrapPcmInWav(pcmData: Buffer, sampleRate: number): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate  = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize  = pcmData.length;

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmData]);
}

// ─────────────────────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, sessionId } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: 'Session required' }, { status: 401 });
    }

    // ── Clean text for TTS ───────────────────────────────────
    const words = text.trim().split(/\s+/);
    const trimmedText = words
      .slice(0, 200)
      .join(' ')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\*+([^*]+)\*+/g, '$1')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .trim();

    console.log('[Trikal TTS v4.0] Synthesizing:', words.length, 'words for session:', sessionId);

    // ── Try Gemini-TTS first (all packs) ────────────────────
    let result = await synthesizeGeminiTTS(trimmedText);

    // ── Fallback to Neural2-D ────────────────────────────────
    if (!result) {
      console.warn('[Trikal TTS v4.0] Gemini-TTS failed, using Neural2 fallback');
      result = await synthesizeNeural2(trimmedText);
    }

    if (!result || result.buffer.length === 0) {
      return NextResponse.json({ error: 'Voice synthesis failed' }, { status: 500 });
    }

    return new NextResponse(result.buffer, {
      status : 200,
      headers: {
        'Content-Type'         : result.mime,
        'Content-Length'       : result.buffer.length.toString(),
        'Cache-Control'        : 'no-store',
        'X-Trikal-Voice-Engine': result.mime === 'audio/wav' ? `gemini-tts-${GEMINI_TTS_VOICE}` : FALLBACK_VOICE,
      },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Trikal TTS v4.0] Fatal:', message);
    return NextResponse.json({ error: 'Voice synthesis failed', detail: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status         : 'Trikal Voice TTS API is live',
    version        : '4.0',
    voice_primary  : `Gemini-TTS ${GEMINI_TTS_VOICE} (all packs)`,
    voice_fallback : FALLBACK_VOICE,
    quality        : 'CEO mandated — maximum quality for all users',
    cost_per_pred  : '~₹1.00',
  });
}
