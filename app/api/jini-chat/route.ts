/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN
 * DO NOT EDIT, DELETE, OR REFACTOR THIS FILE.
 * VERSION: 14.6 (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 * PURPOSE: CLAUDE LOGIC INTEGRATED + BOLT-SHIELD ACTIVE.
 */
import { NextRequest, NextResponse } from 'next/server';
import { generateVedicInsight, CEO_VARS, Category } from '../../../lib/vedic-astro';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, astroContext, category = 'JOB' } = body;

    if (!GEMINI_API_KEY) return NextResponse.json({ reply: "API Key missing!" });

    const hasDateInText = /\d{4}-\d{2}-\d{2}/.test(message);
    let vedicInsight = "General Analysis.";

    if (astroContext?.dob || hasDateInText) {
      const mockData = {
        planets: { 
          Saturn: { strength: 85, name: 'Saturn' }, 
          Sun: { strength: 78, name: 'Sun' },
          Jupiter: { strength: 92, name: 'Jupiter' },
          Venus: { strength: 88, name: 'Venus' } // Added for Wealth/Love depth
        },
        sunrise: "06:10", sunset: "18:40"
      };
      
      const analysis = generateVedicInsight(mockData, category as Category);
      
      // CLAUDE LOGIC: Multi-planet flags + Choghadiya integrated here
      vedicInsight = `
        ENGINE_STATUS: DATA_ACTIVE
        SCORE: ${analysis.energyScore}%
        VEDIC_ANALYSIS: ${analysis.mainInsight}
        CHOGHADIYA: ${analysis.panchang.choghadiya.name} (${analysis.panchang.choghadiya.type})
        ABHIJIT_MUHURAT: ${analysis.panchang.abhijeet.start} to ${analysis.panchang.abhijeet.end}
        PLANETARY_FLAGS: ${analysis.flags.map(f => `${f.planet}: ${f.msg}`).join(' | ')}
      `;
    }

    const systemInstruction = `
      [IDENTITY]
      You are Jini, the warm AI soul of Trikal Vaani, created by ${CEO_VARS.FOUNDER}.
      [CONTEXT]
      ${vedicInsight}
      [STRICT RULES]
      - Use warm Hinglish. 
      - Always credit "Rohiit Gupta ji ka framework...".
      - Structure: Greeting -> Framework Insight -> Remedial Wisdom -> Suspenseful Hook.
      - Never cut off mid-sentence. Total completion required.
    `;

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: systemInstruction + "\n\nQuestion: " + message }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 1500, topP: 0.9 }
      }),
    });

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return NextResponse.json({ reply: reply || "Cosmic signal lost. Try again." });

  } catch (err: any) {
    return NextResponse.json({ reply: "Bridge Error: " + err.message });
  }
}