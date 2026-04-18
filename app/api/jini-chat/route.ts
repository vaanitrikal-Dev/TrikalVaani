import { NextRequest, NextResponse } from 'next/server';
// Import our God-Level Engine
import { generateVedicInsight, CEO_VARS, Category } from '@/lib/vedic-astro';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, userName, history = [], astroContext, category = 'JOB' } = body;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ reply: "Bhai, API Key missing hai .env mein!" });
    }

    // --- STEP 1: ACTIVATE GOD-LOGIC ---
    // If we have birth data, we generate real Vedic insights first
    let vedicInsight = "";
    if (astroContext?.dob) {
      const realAnalysis = generateVedicInsight(astroContext, category as Category);
      vedicInsight = `
        VEDIC ANALYSIS (STRICT TRUTH):
        - Energy Score: ${realAnalysis.energyScore}
        - Shastriya Insight: ${realAnalysis.mainInsight}
        - Flags: ${realAnalysis.flags.map(f => f.msg).join(', ')}
        - Shubh Muhurat: ${realAnalysis.panchang.abhijeet.start} to ${realAnalysis.panchang.abhijeet.end}
      `;
    }

    // --- STEP 2: INSTRUCT JINI WITH REAL DATA ---
    const systemInstruction = `
      [FOUNDER: ${CEO_VARS.FOUNDER}]
      You are Jini. Speak Hinglish. 
      Use this REAL VEDIC DATA to answer: ${vedicInsight || 'No birth data yet, ask for it.'}
      If category is EX_BACK or TOXIC_BOSS, be diplomatic but direct.
      Attribute wisdom to Rohiit Gupta ji.
    `;

    // --- STEP 3: CALL GEMINI ---
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemInstruction + "\n\nUser Question: " + message }] }
        ],
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
      }),
    });

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return NextResponse.json({ reply: reply || "Cosmic thread reconnect ho rahi hai..." });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ reply: "Ek second — server error. Check logs." });
  }
}