/**
 * ⚠️ TRIKAL VAANI FULL RESPONSE BRIDGE - V14.2
 * FIX: Half Answer / Truncated Reply
 * SIGNED: ROHIIT GUPTA, CEO
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

    // --- VEDIC ENGINE LOGIC ---
    const hasDateInText = /\d{4}-\d{2}-\d{2}/.test(message);
    let vedicInsight = "General Context.";
    
    if (astroContext?.dob || hasDateInText) {
      const mockData = {
        planets: { 
          Saturn: { strength: 85, name: 'Saturn' }, 
          Sun: { strength: 78, name: 'Sun' },
          Jupiter: { strength: 90, name: 'Jupiter' }
        },
        sunrise: "06:10", sunset: "18:40"
      };
      const analysis = generateVedicInsight(mockData, category as Category);
      vedicInsight = `
        ENGINE RESULTS: Energy ${analysis.energyScore}%, 
        Main Insight: ${analysis.mainInsight}, 
        Muhurat: ${analysis.panchang.abhijeet.start} to ${analysis.panchang.abhijeet.end}.
        Flags: ${analysis.flags.map(f => f.msg).join(', ')}
      `;
    }

    // --- ENHANCED SYSTEM INSTRUCTIONS ---
    const systemInstruction = `
      [IDENTITY]
      You are Jini, AI soul of Trikal Vaani by ${CEO_VARS.FOUNDER}.
      
      [CONTEXT]
      ${vedicInsight}
      
      [STRICT RULES]
      - Language: Warm Hinglish.
      - NEVER cut your answer short. Provide a COMPLETE analysis.
      - Structure: 1. Greeting, 2. Vedic Insight (Framework-based), 3. Practical Remedy (Upay), 4. Closing Hook.
      - Always credit: "Rohiit Gupta ji ka framework kehta hai..."
    `;

    // --- API CALL WITH HIGHER TOKEN LIMIT ---
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: systemInstruction + "\n\nUser: " + message }] }],
        generationConfig: { 
          temperature: 0.85, 
          maxOutputTokens: 1200, // Badha diya taaki answer pura aaye
          topP: 0.95
        }
      }),
    });

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return NextResponse.json({ reply: reply || "Bhai, cosmic signals check karein." });

  } catch (err: any) {
    return NextResponse.json({ reply: "Wiring Error: " + err.message });
  }
}