/**
 * ⚠️ FINAL SUCCESS VERSION V13.6
 * MODEL: gemini-1.5-flash (Fixed URL Error)
 * SIGNED: ROHIIT GUPTA, CEO
 */
import { NextRequest, NextResponse } from 'next/server';
import { generateVedicInsight, CEO_VARS, Category } from '../../../lib/vedic-astro';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
// MODEL NAME UPDATED TO FLASH FOR STABILITY & SPEED
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, userName, astroContext, category = 'JOB' } = body;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ reply: "Bhai, API Key .env mein nahi mili!" });
    }

    // --- DATA DETECTION ---
    const hasDateInText = /\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4}/.test(message);
    const effectiveContext = astroContext || (hasDateInText ? { dob: "Auto-Detected" } : null);

    let vedicInsight = "USER DATA STATUS: Details not yet provided.";
    
    if (effectiveContext) {
      try {
        const mockApiData = {
          planets: { 
            Saturn: { strength: 82, name: 'Saturn', is_retrograde: false }, 
            Sun: { strength: 75, name: 'Sun', is_retrograde: false },
            Venus: { strength: 60, name: 'Venus', is_retrograde: false }
          },
          sunrise: "06:15",
          sunset: "18:45"
        };
        const analysis = generateVedicInsight(mockApiData, category as Category);
        vedicInsight = `
          ANALYSIS: Energy ${analysis.energyScore}%, 
          Insight: ${analysis.mainInsight},
          Muhurat: ${analysis.panchang.abhijeet.start} to ${analysis.panchang.abhijeet.end}
        `;
      } catch (e) { console.error(e); }
    }

    const systemInstruction = `
      You are Jini, AI soul of Trikal Vaani by ${CEO_VARS.FOUNDER}.
      Use this DATA: ${vedicInsight}.
      Speak Hinglish. Be warm and professional.
      If birth details are in the message, acknowledge and analyze.
      Always say: "Rohiit Gupta ji ka framework kehta hai..."
    `;

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemInstruction + "\n\nUser: " + message }] }
        ],
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
      }),
    });

    const data = await res.json();
    
    if (data.error) {
       return NextResponse.json({ reply: `Gemini Error: ${data.error.message}. Please check API settings.` });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return NextResponse.json({ 
      reply: reply || "Bhai, signals mil rahe hain... ek baar dobara puchiye?" 
    });

  } catch (err: any) {
    return NextResponse.json({ reply: "Wiring Error: " + err.message });
  }
}