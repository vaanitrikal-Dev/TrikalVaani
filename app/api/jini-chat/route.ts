/** * ⚠️ STABLE PRODUCTION RELEASE V13.9
 * FIX: Invalid Credentials / OAuth Error
 * SIGNED: ROHIIT GUPTA, CEO
 */
import { NextRequest, NextResponse } from 'next/server';
import { generateVedicInsight, CEO_VARS, Category } from '../../../lib/vedic-astro';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
// STABLE PRODUCTION URL (Removing 'v1beta' and using 'v1' for maximum key compatibility)
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, astroContext, category = 'JOB' } = body;

    if (!GEMINI_API_KEY) return NextResponse.json({ reply: "Bhai, API Key check karein!" });

    // --- LOGIC TRIGGER ---
    const hasDateInText = /\d{4}-\d{2}-\d{2}/.test(message);
    let vedicInsight = "General Analysis.";
    
    if (astroContext?.dob || hasDateInText) {
      const mockData = {
        planets: { Saturn: { strength: 80, name: 'Saturn' }, Sun: { strength: 75, name: 'Sun' } },
        sunrise: "06:10", sunset: "18:40"
      };
      const analysis = generateVedicInsight(mockData, category as Category);
      vedicInsight = `ROHIIT GUPTA ENGINE: Energy ${analysis.energyScore}%, Insight: ${analysis.mainInsight}, Muhurat: ${analysis.panchang.abhijeet.start}.`;
    }

    // --- CLEAN FETCH CALL ---
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `You are Jini from Trikal Vaani. Context: ${vedicInsight}. Respond to: ${message}` }] }]
      }),
    });

    const data = await res.json();
    
    // Exact Error Reporting if it fails
    if (data.error) {
       return NextResponse.json({ reply: `System Notice: ${data.error.message}` });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ reply: reply || "Bhai, cosmic signals check karein." });

  } catch (err: any) {
    return NextResponse.json({ reply: "Wiring Error: " + err.message });
  }
}