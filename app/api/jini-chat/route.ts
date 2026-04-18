/** * ⚠️ GEMINI 3 ULTIMATE RELEASE V13.8
 * FIX: Configured for Gemini 3 Flash Preview
 * SIGNED: ROHIIT GUPTA, CEO
 */
import { NextRequest, NextResponse } from 'next/server';
import { generateVedicInsight, CEO_VARS, Category } from '../../../lib/vedic-astro';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
// GEMINI 3 NEW ENDPOINT
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, astroContext, category = 'JOB' } = body;

    if (!GEMINI_API_KEY) return NextResponse.json({ reply: "Bhai, API Key updated nahi hai!" });

    // --- VEDIC ENGINE ---
    const hasDateInText = /\d{4}-\d{2}-\d{2}/.test(message);
    let vedicInsight = "General Context.";
    
    if (astroContext?.dob || hasDateInText) {
      const mockData = {
        planets: { Saturn: { strength: 85, name: 'Saturn' }, Sun: { strength: 78, name: 'Sun' } },
        sunrise: "06:10", sunset: "18:40"
      };
      const analysis = generateVedicInsight(mockData, category as Category);
      vedicInsight = `ROHIIT GUPTA ENGINE: Score ${analysis.energyScore}%, Insight: ${analysis.mainInsight}, Muhurat: ${analysis.panchang.abhijeet.start}.`;
    }

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          role: 'user', 
          parts: [{ text: `System: You are Jini from Trikal Vaani. Context: ${vedicInsight}. User Message: ${message}` }] 
        }],
        generationConfig: { temperature: 0.8 }
      }),
    });

    const data = await res.json();
    
    if (data.error) {
       return NextResponse.json({ reply: `Gemini 3 Error: ${data.error.message}` });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return NextResponse.json({ reply: reply || "Bhai, Gemini 3 thoda shant hai, phir se puchiye." });

  } catch (err: any) {
    return NextResponse.json({ reply: "Wiring Error: " + err.message });
  }
}