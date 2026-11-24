/**
 * ============================================================
 * TRIKAL VAANI — Voice Prediction API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/voice-predict/route.ts
 * VERSION: 1.6 (24 Nov 2026) — Rohiit approved 24 Nov 2026 ("approve"):
 *   1. BALANCE CHECK: jawab banane se pehle lib/voice-balance.ts — session ka
 *      active pack (sawaal bache, expire nahi) na ho to 402. Pehle koi bhi
 *      bina pack ke free AI jawab le sakta tha.
 *   2. ASLI KUNDLI: janm-sthan Google Geocoding se lat/lng (sirf India, IST
 *      timezone 5.5) → VM Swiss Ephemeris /kundali (callVM) →
 *      lagna, chandra rashi, nakshatra, CHALU mahadasha/antardasha (tareekh
 *      ke saath), grah-bhav. AI ko sirf yahi tathya bolne ki ijazat — pehle
 *      AI dasha andaze se bolta tha ("Shani ki dasha" bina hisaab ke).
 *      Kundli na bane (videsh / place na mile) to AI ko saaf mana: koi dasha
 *      ka naam mat lo.
 *   3. SIRF ROMAN AKSHAR: prompt niyam + safai filter (Devanagari akshar
 *      hatao) — "Panchम bhaav" jaisi mixed-script galti band.
 *   AI chain, 6000 tokens, TTS cleanup, response shape — v1.5.1 jaisa.
 * Prior: 1.5.1 (29 Sep 2026) — AI fallback (ai-fallback v1.1: Claude 10s reserve) (CEO approved: "pehle sab pe laga do")
 * UPDATE 3.7 → 3.8 (5 Nov 2026, CEO order: gemini-3.7-flash band — saare live calls gemini-3.8-flash pe)
 *   v1.5: Pehle EK Gemini call — 503 par "Prediction failed". Ab
 *   lib/ai-fallback.ts: gemini-3.7-flash → gemini-3.8-flash (bheed par ek
 *   retry) → Claude Sonnet 5, sab 30s limit ke andar. Prompt, 6000 tokens,
 *   TTS cleanup — sab v1.4 jaisa.
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v1.2 CHANGES (May 10, 2026):
 *   - MIGRATED 3 Sep 2026: gemini-2.5-flash -> gemini-3.7-flash.
 *     2.5-flash and 2.5-pro SHUT DOWN ON 16 OCTOBER 2026.
 *     maxOutputTokens stays 6000: already generous, and 3.x needs the room
 *     because its reasoning is charged to the same budget as the text.
 *   - FIXED: maxOutputTokens 250 → 800
 *   - REASON: Hindi script = 2-4 tokens/word, 250 only gave 40-60 words
 *   - RESULT: Full 90-120 word Hinglish prediction = ~45-60 sec audio
 *   - SAME: Flexible request format, no revenue guard, no markdown/emojis
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateWithFallback } from '@/lib/ai-fallback';
import { checkVoiceBalance } from '@/lib/voice-balance';           // v1.6
import { callVM } from '@/lib/callVM';                            // v1.6

// ── v1.6: janm-sthan → lat/lng (Google Geocoding, sirf India) ─────────────
async function geocodeIndia(place: string): Promise<{ lat: number; lng: number; label: string } | null> {
  const key = process.env.GOOGLE_MAPS_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!key || !place.trim()) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&region=in&key=${key}`;
    const r = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(4000) });
    if (!r.ok) return null;
    const j: any = await r.json();
    const hit = j?.results?.[0];
    const country = (hit?.address_components || []).find((c: any) => (c.types || []).includes('country'))?.short_name;
    const loc = hit?.geometry?.location;
    if (country !== 'IN' || typeof loc?.lat !== 'number') return null; // IST (5.5) maan kar kundli banti hai — sirf India
    return { lat: loc.lat, lng: loc.lng, label: hit.formatted_address || place };
  } catch (e: any) {
    console.error('[VoicePredict v1.6] geocode failed:', e?.message);
    return null;
  }
}

// ── v1.6: asli kundli ke tathya — VM Swiss Ephemeris engine (/kundali) ──
// NOTE: lib/swiss-ephemeris.ts (Meeus) JAAN-BOOJH KAR use NAHI kiya — 24 Nov
// 2026 test (Rohiit ka chart) mein galat lagna aur grah de raha tha; VM wahi
// engine hai jo MCP janam_kundali aur calculators chalata hai.
async function chartFacts(dob: string, tob: string, pob: string): Promise<string | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || !/^\d{1,2}:\d{2}/.test(tob) || !pob) return null;
  const g = await geocodeIndia(pob);
  if (!g) return null;
  try {
    const [hh, mm] = tob.split(':').map(Number);
    const res = await callVM('/kundali', {
      method: 'POST',
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        year: Number(dob.slice(0, 4)), month: Number(dob.slice(5, 7)), day: Number(dob.slice(8, 10)),
        hour: hh, minute: mm, second: 0,
        latitude: g.lat, longitude: g.lng, timezone: 5.5, ayanamsa: 'lahiri',
      }),
    });
    if (!res.ok) { console.error('[VoicePredict v1.6] VM /kundali', res.status); return null; }
    const k: any = await res.json();
    const grahas: any[] = Array.isArray(k?.grahas) ? k.grahas : [];
    if (!k?.lagna?.sign || !grahas.length) return null;
    const ym = (d: any) => String(d ?? '').slice(0, 7);
    const now = new Date();
    const mahaList: any[] = Array.isArray(k?.dasha?.maha_dasha) ? k.dasha.maha_dasha : [];
    const maha = mahaList.find(m => new Date(m.start) <= now && now <= new Date(m.end));
    const antarList: any[] = maha?.antar ?? [];
    const antar = antarList.find(a => new Date(a.start) <= now && now <= new Date(a.end));
    const upcoming = antarList.filter(a => new Date(a.start) > now).slice(0, 4)
      .map(a => `${a.planet} from ${ym(a.start)}`).join(', ');
    const moon = grahas.find(x => String(x?.planet ?? '').toLowerCase().startsWith('moon'));
    const planets = grahas
      .map(x => `${x.planet} in ${x.sign} (house ${x.house}${(x.retrograde ?? x.is_retrograde) ? ', vakri' : ''})`)
      .join('; ');
    return [
      `Lagna: ${k.lagna.sign}${k.lagna.sign_lord ? ` (lagna lord ${k.lagna.sign_lord})` : ''}`,
      `Chandra rashi: ${moon?.sign ?? 'unknown'}; Janm nakshatra: ${moon?.nakshatra ?? 'unknown'}`,
      maha ? `CURRENT Mahadasha: ${maha.planet} (${ym(maha.start)} to ${ym(maha.end)})` : 'CURRENT Mahadasha: not available',
      antar ? `CURRENT Antardasha: ${antar.planet} (${ym(antar.start)} to ${ym(antar.end)})` : 'CURRENT Antardasha: not available',
      `Upcoming antardashas: ${upcoming || 'n/a'}`,
      `Planets: ${planets}`,
    ].join('\n');
  } catch (e: any) {
    console.error('[VoicePredict v1.6] chart failed:', e?.message);
    return null;
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';

type FlexibleBody = {
  transcription?: string;
  name?: string;
  dob?: string;
  tob?: string;
  pob?: string;
  message?: string;
  userName?: string;
  birthData?: {
    name?: string;
    dob?: string;
    tob?: string;
    pob?: string;
  };
  sessionId?: string;
};

export async function POST(req: NextRequest) {
  const t0 = Date.now(); // v1.6: AI deadline request ke shuru se (geocode bhi isi 30s mein)
  try {
    const body: FlexibleBody = await req.json();

    const transcription = body.transcription || body.message || '';
    const name = body.name || body.userName || body.birthData?.name || '';
    const dob  = body.dob  || body.birthData?.dob  || '';
    const tob  = body.tob  || body.birthData?.tob  || '';
    const pob  = body.pob  || body.birthData?.pob  || '';
    const sessionId = body.sessionId;

    if (!transcription) {
      return NextResponse.json(
        { error: 'Question/transcription required', received: Object.keys(body) },
        { status: 400 }
      );
    }
    if (!sessionId) {
      return NextResponse.json({ error: 'Session required' }, { status: 401 });
    }
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    // v1.6: paisa (active pack) nahi to jawab nahi
    const bal = await checkVoiceBalance(sessionId);
    if (!bal.ok) {
      console.warn('[VoicePredict v1.6] blocked — no active pack:', bal.reason);
      return NextResponse.json({ error: 'No active voice pack. Please buy a pack to ask.' }, { status: 402 });
    }

    // v1.6: asli kundli (na bane to null)
    const facts = await chartFacts(dob, tob, pob);
    console.log('[VoicePredict v1.6] chart facts:', facts ? 'yes' : 'no');

    console.log('[VoicePredict v1.2] Request:', {
      hasTranscription: !!transcription,
      transcriptionLength: transcription.length,
      hasName: !!name,
      hasDob : !!dob,
    });

    const birthInfo = [
      name && `Name: ${name}`,
      dob  && `Date of Birth: ${dob}`,
      tob  && `Time of Birth: ${tob}`,
      pob  && `Place of Birth: ${pob}`,
    ].filter(Boolean).join('\n');

    // ── Voice prediction system prompt ──────────────────────
    const systemPrompt = `You are Trikaal — an authoritative Vedic astrologer speaking directly to a seeker.
The seeker has PAID for this voice prediction. Give them a REAL, COMPLETE, HELPFUL answer.

CRITICAL RULES:
1. Respond in Hinglish (natural mix of Hindi and English) written ONLY in Roman/English letters. NEVER use Devanagari script — not even one letter (write "Pancham", never "पंचम" or "Panchम")
2. Write EXACTLY 100 to 120 words — count carefully. Not 40 words. Not 60 words. MINIMUM 100.
3. NO markdown — no bold, no links, no bullet points, no asterisks
4. NO emojis — they sound terrible when spoken aloud
5. NO sales pitch — no service links, no "gehri reading ke liye"
6. Speak warmly, like a wise compassionate guru to a worried parent
7. Reference their birth details if provided
8. Give ACTUAL specific Vedic guidance. Mention a planet, dasha, house, lagna, rashi or nakshatra ONLY if it appears in the CHART FACTS given to you — these were calculated from the seeker's real birth chart. NEVER invent or guess a dasha, planet position or house. If CHART FACTS say "not available", do NOT name any current dasha or planet placement — give general guidance instead
9. Give ONE clear actionable remedy at the end
10. This will be spoken as audio — write naturally for the ear

REMEMBER: 100-120 words is mandatory. Count every word.`;

    const userMessage = `Seeker's birth details:
${birthInfo || '(not provided)'}

CHART FACTS (calculated — use only these, never invent others):
${facts || 'not available — do not name any dasha or planet placement'}

Seeker's voice question:
"${transcription}"

Write a warm, specific 100-120 word Hinglish voice prediction. Count your words — minimum 100.`;

    // ── Call Gemini 2.5 Flash ────────────────────────────────
    // v1.5: 3.7 → 3.8 → Claude Sonnet 5, 30s maxDuration ke andar
    let prediction = '';
    try {
      const ai = await generateWithFallback({
        tag: 'voice-predict',
        prompt: userMessage,
        systemInstruction: systemPrompt,
        models: ['gemini-3.8-flash'],
        maxOutputTokens: 6000,  // CEO ORDER: 6000 tokens for rich complete Devanagari predictions
        temperature: 0.85,
        topP: 0.9,
        perCallTimeoutMs: 10_000,
        deadlineMs: t0 + 27_000,
        claudeMaxTokens: 1500,
        claudeMinMs: 8_000,
        claudeReserveMs: 10_000,
        minChars: 40,
      });
      prediction = ai.text;
    } catch (e) {
      console.error('[VoicePredict v1.5] All AI failed:', e instanceof Error ? e.message.slice(0, 300) : e);
      return NextResponse.json({ error: 'Prediction failed' }, { status: 500 });
    }

    // ── Strip all markdown/links/emojis for clean TTS ────────
    prediction = prediction
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/#+\s/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/\n{2,}/g, ' ')
      .replace(/\n/g, ' ')
      .replace(/[\u0900-\u097F]+/g, '')   // v1.6: Devanagari akshar hatao (Roman-only)
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (!prediction) {
      return NextResponse.json({ error: 'Empty prediction' }, { status: 500 });
    }

    const wordCount = prediction.split(/\s+/).length;
    console.log('[VoicePredict v1.2] Generated:', wordCount, 'words —', prediction.substring(0, 80));

    return NextResponse.json({
      success   : true,
      prediction,
      reply     : prediction,
      text      : prediction,
      wordCount,
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[VoicePredict v1.2] Fatal:', message);
    return NextResponse.json({ error: 'Prediction failed', detail: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status  : 'Trikaal Voice Predict API is live',
    version : '1.6',
    fix     : 'maxOutputTokens 6000 — CEO approved for maximum quality',
  });
}
