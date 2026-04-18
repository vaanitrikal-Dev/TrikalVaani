/**
 * ⚠️ STRICT CEO ORDER: LOGIC FROZEN (REPAIR V13.2)
 * VERSION: 13.2 (GOD-LEVEL SAFE)
 * SIGNED: ROHIIT GUPTA, CEO
 */
import { NextRequest, NextResponse } from 'next/server';
import { generateVedicInsight, CEO_VARS, Category } from '@/lib/vedic-astro';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, userName, astroContext, category = 'JOB' } = body;

    if (!GEMINI_API_KEY) return NextResponse.json({ reply: "Bhai, API Key missing hai .env mein!" });

    // --- STEP 1: SAFE VEDIC DATA FETCH ---
    let vedicInsight = "USER DATA STATUS: Birth details not provided yet.";
    
    // Check if birth data exists before running calculation
    if (astroContext && astroContext.dob) {
      try {
        // Hum Mock data provide kar rahe hain jab tak API connect na ho
        const mockApiData = {
          planets: { Saturn: { strength: 72, name: 'Saturn' }, Sun: { strength: 65, name: 'Sun' } },
          sunrise: "06:00",
          sunset: "18:30"
        };
        const realAnalysis = generateVedicInsight(mockApiData, category as Category);
        vedicInsight = `
          VEDIC TRUTH: Energy ${realAnalysis.energyScore}, 
          Insight: ${realAnalysis.mainInsight},
          Muhurat: ${realAnalysis.panchang.abhijeet.start} to ${realAnalysis.panchang.abhijeet.end}
        `;
      } catch (e) {
        console.error("Logic Error:", e);
      }
    }

    // --- STEP 2: REFINED SYSTEM PROMPT ---
    const systemInstruction = `
      Founder: ${CEO_VARS.FOUNDER}. Platform: Trikal Vaani.
      You are Jini, a warm Hinglish Guru. 
      CONTEXT: ${vedicInsight}
      RULE: If Birth Details are missing, ask for DOB, Time, and City politely.
      User Message: ${message}
    `;

    // --- STEP 3: CALL GEMINI ---
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: systemInstruction }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
      }),
    });

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return NextResponse.json({ reply: reply || "Bhai, details milte hi main cosmic analysis shuru kar dungi!" });

  } catch (err) {
    console.error("FATAL ERROR:", err);
    return NextResponse.json({ reply: "Namaste! Ek baar apni Birth Details (DOB, Time, City) share kijiye, taaki main reconnect kar sakoon." });
  }
}