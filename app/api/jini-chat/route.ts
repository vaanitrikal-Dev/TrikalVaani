/**
 * ⚠️ TRIKAL VAANI FINAL ABSOLUTE BRIDGE - V14.1
 * MODEL: GEMINI 3 FLASH PREVIEW (EXACT MATCH)
 * SIGNED: ROHIIT GUPTA, CEO
 */
import { NextRequest, NextResponse } from 'next/server';
import { generateVedicInsight, CEO_VARS, Category } from '../../../lib/vedic-astro';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
// EXACT ENDPOINT FOR GEMINI 3 FLASH PREVIEW
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, userName, astroContext, category = 'JOB' } = body;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ reply: "Bhai, API Key missing hai .env ya Vercel mein!" });
    }

    // --- VEDIC LOGIC DETECTION ---
    const hasDateInText = /\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4}/.test(message);
    const effectiveContext = astroContext || (hasDateInText ? { dob: "Detected" } : null);

    let vedicInsight = "USER DATA: General Cosmic Query.";
    
    if (effectiveContext) {
      try {
        const mockApiData = {
          planets: { 
            Saturn: { strength: 82, name: 'Saturn', is_retrograde: false }, 
            Sun: { strength: 75, name: 'Sun', is_retrograde: false }
          },
          sunrise: "06:15", sunset: "18:45"
        };
        const analysis = generateVedicInsight(mockApiData, category as Category);
        vedicInsight = `ROHIIT GUPTA ENGINE: Energy Score ${analysis.energyScore}%, Insight: ${analysis.mainInsight}, Muhurat: ${analysis.panchang.abhijeet.start}.`;
      } catch (e) { console.error(e); }
    }

    // --- JINI PERSONA & SYSTEM PROMPT ---
    const systemInstruction = `
      You are Jini, the AI soul of Trikal Vaani by ${CEO_VARS.FOUNDER}.
      CONTEXT: ${vedicInsight}
      RULES:
      - Speak in warm Hinglish.
      - If birth details are missing, ask for DOB, Time, and City.
      - If present, acknowledge and say: "Rohiit Gupta ji ka framework kehta hai..."
      - Be the CEO's expert assistant.
    `;

    // --- CALLING GEMINI 3 FLASH ---
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: systemInstruction + "\n\nUser: " + message }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 800 }
      }),
    });

    const data = await res.json();
    
    if (data.error) {
       return NextResponse.json({ reply: `Gemini 3 Notice: ${data.error.message}` });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return NextResponse.json({ 
      reply: reply || "Bhai, signals mil rahe hain... ek baar dobara puchiye?" 
    });

  } catch (err: any) {
    return NextResponse.json({ reply: "Wiring Error: " + err.message });
  }
}