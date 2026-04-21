/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 17.0-MASTER (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: MAIN JINI API — REAL KUNDALI + SHORT CRISP RESPONSES
 * v17.0 CHANGES:
 *   - Added `mode` param handling:
 *       'chat'             → original flow (280 tokens, system prompt)
 *       'prediction'       → instant prediction (300 tokens, direct prompt)
 *       'deep_prediction'  → full Trikal Intelligence reading (800 tokens, direct prompt)
 *   - deep_prediction bypasses system prompt — uses the full structured prompt
 *     from PersonalizedPrediction.tsx directly
 *   - maxOutputTokens increased per mode to prevent cut-off responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildKundali, type BirthData } from '../../../lib/swiss-ephemeris';
import { buildJiniSystemPrompt, detectLanguage, JINI_NAMASTE } from '../../../lib/jini-engine';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_URL     =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      message:        string;
      mode?:          'chat' | 'prediction' | 'deep_prediction';
      birthData?:     BirthData;
      chartData?:     Record<string, unknown>;
      category?:      string;
      isFirstMessage?: boolean;
    };

    const {
      message,
      mode          = 'chat',
      birthData,
      category      = 'JOB',
      isFirstMessage = false,
    } = body;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ reply: 'API Key missing.' });
    }

    // ── FIRST MESSAGE — Jini signature opening ─────────────────────────────
    if (isFirstMessage) {
      return NextResponse.json({ reply: JINI_NAMASTE, kundaliSummary: null });
    }

    // ── DEEP PREDICTION MODE ───────────────────────────────────────────────
    // Full structured prompt from PersonalizedPrediction.tsx
    // Bypasses system prompt — message IS the complete prompt
    // Needs 800 tokens for: scores + main prediction + key dates + action + hook
    if (mode === 'deep_prediction') {
      const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role:  'user',
            parts: [{ text: message }],
          }],
          generationConfig: {
            temperature:     0.80,
            maxOutputTokens: 800,  // ✅ enough for full structured reading
            topP:            0.92,
          },
        }),
      });

      if (!res.ok) {
        console.error(`[Trikal] Gemini deep_prediction HTTP ${res.status}`);
        return NextResponse.json({
          reply: '',
          error: `Gemini HTTP ${res.status}`,
        });
      }

      const data  = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';

      if (!reply) {
        console.error('[Trikal] Gemini deep_prediction — empty reply', data);
        return NextResponse.json({ reply: '', error: 'Empty response from Gemini' });
      }

      return NextResponse.json({ reply });
    }

    // ── PREDICTION MODE ────────────────────────────────────────────────────
    // AutoPrediction / instant rule-deepener
    // Direct prompt, no system prompt override, 300 tokens
    if (mode === 'prediction') {
      const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role:  'user',
            parts: [{ text: message }],
          }],
          generationConfig: {
            temperature:     0.85,
            maxOutputTokens: 300,
            topP:            0.9,
          },
        }),
      });

      if (!res.ok) {
        console.error(`[Trikal] Gemini prediction HTTP ${res.status}`);
        return NextResponse.json({ reply: '' });
      }

      const data  = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
      return NextResponse.json({ reply });
    }

    // ── CHAT MODE (default) ────────────────────────────────────────────────
    // Original Jini chat flow — unchanged from v16.0

    // Build real Kundali from Swiss Ephemeris
    let kundali       = null;
    let kundaliSummary = null;

    if (birthData?.dob && birthData?.tob && birthData?.lat) {
      try {
        kundali = buildKundali(birthData);
        kundaliSummary = {
          lagna:         kundali.lagna,
          lagnaLord:     kundali.lagnaLord,
          nakshatra:     kundali.nakshatra,
          nakshatraLord: kundali.nakshatraLord,
          mahadasha:     kundali.currentMahadasha.lord,
          antardasha:    kundali.currentAntardasha.lord,
          dashaBalance:  kundali.dashaBalance,
          choghadiya:    kundali.panchang.choghadiya,
          rahuKaal:      kundali.panchang.rahuKaal,
          abhijeet:      kundali.panchang.abhijeetMuhurta,
          tithi:         kundali.panchang.tithi,
          vara:          kundali.panchang.vara,
          yoga:          kundali.panchang.yoga,
          planets: Object.values(kundali.planets).map(p => ({
            name:         p.name,
            rashi:        p.rashi,
            house:        p.house,
            strength:     p.strength,
            isRetrograde: p.isRetrograde,
            nakshatra:    p.nakshatra,
            degree:       p.degree,
          })),
        };
      } catch (calcErr) {
        console.error('[Trikal] Kundali error:', calcErr);
      }
    }

    const lang         = detectLanguage(message);
    const systemPrompt = buildJiniSystemPrompt(kundali, category, lang, birthData?.name);

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
        generationConfig: {
          temperature:     0.85,
          maxOutputTokens: 280,  // kept small for crisp chat responses
          topP:            0.9,
        },
      }),
    });

    if (!res.ok) {
      console.error(`[Trikal] Gemini chat HTTP ${res.status}`);
      return NextResponse.json({
        reply: 'Cosmic signals weak hain. Ek minute mein dobara try karein. 🙏',
        kundaliSummary,
      });
    }

    const data = await res.json();

    if (data.error) {
      console.error('[Trikal] Gemini error:', data.error);
      return NextResponse.json({
        reply: 'Jini abhi meditate kar rahi hai. 🙏',
        kundaliSummary,
      });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      ?? 'Dobara puchiye. 🙏';

    return NextResponse.json({ reply, kundaliSummary });

  } catch (err: unknown) {
    console.error('[Trikal] Error:', err);
    return NextResponse.json({ reply: 'Kuch cosmic disturbance aa gayi. 🙏' });
  }
}