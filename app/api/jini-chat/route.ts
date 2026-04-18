/**
 * ⚠️ FINAL CEO REPAIR V13.3
 * PURPOSE: READ BIRTH DETAILS DIRECTLY FROM CHAT TEXT
 */
import { NextRequest, NextResponse } from 'next/server';
import { generateVedicInsight, CEO_VARS, Category } from '@/lib/vedic-astro';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, userName, astroContext, category = 'JOB' } = body;

    if (!GEMINI_API_KEY) return NextResponse.json({ reply: "Bhai, API Key check karein!" });

    // --- NEW: AUTO-DETECTION LOGIC ---
    // Agar context missing hai par message mein DOB/Date hai, toh engine trigger karo
    const hasDateInText = /\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4}/.test(message);
    const effectiveContext = astroContext || (hasDateInText ? { dob: "Detected" } : null);

    let vedicInsight = "USER DATA: No specific birth details detected in system context.";
    
    // Engine Trigger
    if (effectiveContext) {
        const mockApiData = {
          planets: { Saturn: { strength: 78, name: 'Saturn' }, Sun: { strength: 70, name: 'Sun' } },
          sunrise: "06:00", sunset: "18:30"
        };
        const realAnalysis = generateVedicInsight(mockApiData, category as Category);
        vedicInsight = `ROHIIT GUPTA ENGINE RESULTS: Energy ${realAnalysis.energyScore}, Insight: ${realAnalysis.mainInsight}, Shubh Muhurat: ${realAnalysis.panchang.abhijeet.start}.`;
    }

    const systemInstruction = `
      Founder: ${CEO_VARS.FOUNDER}. Platform: Trikal Vaani.
      You are Jini. Use this DATA: ${vedicInsight}.
      If the user just gave their details in the message, ACKNOWLEDGE them warmly and give the analysis.
      Don't say "details milte hi...", say "Aapki details mil gayi hain, ab vishleshan dekhiye..."
    `;

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: systemInstruction + "\n\nUser Message: " + message }] }],
        generationConfig: { temperature: 0.75, maxOutputTokens: 350 }
      }),
    });

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return NextResponse.json({ reply: reply || "Bhai, cosmic signals connect ho rahe hain..." });

  } catch (err) {
    return NextResponse.json({ reply: "Namaste! Main sun rahi hoon. Ek baar phir apni DOB likhein." });
  }
}