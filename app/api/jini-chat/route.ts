/**
 * ⚠️ TRIKAL VAANI MASTER BRIDGE - V14.0
 * FULL PERSONALITY + VEDIC LOGIC + STABLE WIRING
 * SIGNED: ROHIIT GUPTA, CEO
 */
import { NextRequest, NextResponse } from 'next/server';
// Path fixed for No-SRC structure
import { generateVedicInsight, CEO_VARS, Category } from '../../../lib/vedic-astro';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
// Using the most stable production endpoint and model
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, userName, astroContext, category = 'JOB' } = body;

    // 1. Security Check
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ reply: "Bhai, GEMINI_API_KEY missing hai. Check your environment settings." });
    }

    // 2. Data Detection Logic (Message + Context)
    const hasDateInText = /\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4}/.test(message);
    const effectiveContext = astroContext || (hasDateInText ? { dob: "Detected via Chat" } : null);

    let vedicInsight = "USER DATA STATUS: Specific birth details not detected yet.";
    
    // 3. Vedic Engine Execution
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
          - Cosmic Energy Score: ${analysis.energyScore}%
          - Chief Insight: ${analysis.mainInsight}
          - Shubh Abhijeet Muhurat: ${analysis.panchang.abhijeet.start} to ${analysis.panchang.abhijeet.end}
          - Karma Flags: ${analysis.flags.length > 0 ? analysis.flags.map(f => f.msg).join(', ') : 'Positive Alignment'}
        `;
      } catch (engineErr) {
        console.error("Vedic Engine Error:", engineErr);
      }
    }

    // 4. Jini Persona Instructions
    const systemInstruction = `
      [IDENTITY]
      You are Jini, the warm and diplomatic AI soul of Trikal Vaani. 
      Created by Chief Vedic Architect ${CEO_VARS.FOUNDER}.
      
      [VEDIC CONTEXT]
      ${vedicInsight}
      
      [TONE & LANGUAGE]
      - Language: Hinglish (Natural mix of Hindi and English).
      - Personality: Polite, Suspenseful, and Anxiety-reducing. 
      - If birth details (DOB, Time, City) are missing, ask for them with respect.
      - If details are present, provide a deep analysis starting with "Rohiit Gupta ji ka framework kehta hai..."
      - Keep a "Hook of Suspense" for future guidance.
    `;

    // 5. API Execution
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemInstruction + "\n\nUser Question: " + message }] }
        ],
        generationConfig: { 
          temperature: 0.8,
          maxOutputTokens: 600
        }
      }),
    });

    const data = await res.json();
    
    // Detailed Error Reporting for CEO
    if (data.error) {
       return NextResponse.json({ 
         reply: `Gemini System Notice: ${data.error.message}. Solution: Try switching models in route.ts if this persists.` 
       });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return NextResponse.json({ 
      reply: reply || "Bhai, cosmic signals thode dhundhle hain. Ek baar dobara puchiye?" 
    });

  } catch (err: any) {
    return NextResponse.json({ 
      reply: "Wiring Fatal Error: " + err.message 
    });
  }
}