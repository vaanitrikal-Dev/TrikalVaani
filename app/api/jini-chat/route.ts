/**
 * ⚠️ FINAL CEO REPAIR V13.5 - PATH & LOGIC FIXED
 * VERSION: 13.5 (GOD-LEVEL)
 * SIGNED: ROHIIT GUPTA, CEO
 * PATH: Fixed for No-SRC structure
 */
import { NextRequest, NextResponse } from 'next/server';
// Yahan humne path ko correctly '../../../lib/vedic-astro' kar diya hai
import { generateVedicInsight, CEO_VARS, Category } from '../../../lib/vedic-astro';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, userName, astroContext, category = 'JOB' } = body;

    // 1. API Key Security Check
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ reply: "Bhai, GEMINI_API_KEY environment mein nahi mili. Check .env file." });
    }

    // 2. Data Detection Logic
    // Check if user provided details in message text or if context exists
    const hasDateInText = /\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4}/.test(message);
    const effectiveContext = astroContext || (hasDateInText ? { dob: "Auto-Detected" } : null);

    let vedicInsight = "USER DATA STATUS: Specific birth details not detected yet.";
    
    // 3. Trigger God-Logic Engine
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
          ROHIIT GUPTA VEDIC ENGINE ANALYSIS:
          - Energy Score: ${analysis.energyScore}%
          - Shastriya Insight: ${analysis.mainInsight}
          - Shubh Abhijeet Muhurat: ${analysis.panchang.abhijeet.start} to ${analysis.panchang.abhijeet.end}
          - Critical Flags: ${analysis.flags.length > 0 ? analysis.flags.map(f => f.msg).join(', ') : 'All clear'}
        `;
      } catch (engineErr) {
        console.error("Engine Error:", engineErr);
      }
    }

    // 4. Jini Persona & Instructions
    const systemInstruction = `
      [IDENTITY]
      You are Jini, the AI soul of Trikal Vaani, created by Rohiit Gupta.
      [VEDIC CONTEXT]
      ${vedicInsight}
      [RULES]
      - Use Hinglish (Natural Hindi + English).
      - If birth details are missing, ask for DOB (YYYY-MM-DD), Time, and City politely.
      - If details are present, acknowledge them and give the analysis based on the context provided.
      - Never predict death or accidents.
      - Always credit: "Rohiit Gupta ji ka framework kehta hai..."
    `;

    // 5. Connect to Gemini API
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemInstruction + "\n\nUser Message: " + message }] }
        ],
        generationConfig: { temperature: 0.75, maxOutputTokens: 400 }
      }),
    });

    const data = await res.json();
    
    if (data.error) {
       return NextResponse.json({ reply: `Gemini API Error: ${data.error.message}` });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return NextResponse.json({ 
      reply: reply || "Bhai, cosmic signals thode kamzor hain. Ek baar dobara puchiye?" 
    });

  } catch (err: any) {
    console.error("Wiring Fail:", err);
    return NextResponse.json({ 
      reply: "Wiring Error: " + err.message + ". Check if lib/vedic-astro.ts exists." 
    });
  }
}