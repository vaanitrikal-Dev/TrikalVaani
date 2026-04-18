/**
 * ⚠️ TRIKAL VAANI FINAL MASTERPIECE BRIDGE - V14.3
 * FIX: Maximum Context, No Truncation, Full Framework Coverage
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

    if (!GEMINI_API_KEY) return NextResponse.json({ reply: "API Key setup incomplete!" });

    // --- VEDIC ENGINE LOGIC ---
    const hasDateInText = /\d{4}-\d{2}-\d{2}/.test(message);
    let vedicInsight = "General Life Path Analysis.";
    
    if (astroContext?.dob || hasDateInText) {
      const mockData = {
        planets: { 
          Saturn: { strength: 85, name: 'Saturn' }, 
          Sun: { strength: 78, name: 'Sun' },
          Jupiter: { strength: 92, name: 'Jupiter' }
        },
        sunrise: "06:10", sunset: "18:40"
      };
      const analysis = generateVedicInsight(mockData, category as Category);
      vedicInsight = `
        ENGINE: Energy ${analysis.energyScore}%, 
        Analysis: ${analysis.mainInsight}, 
        Muhurat: ${analysis.panchang.abhijeet.start} to ${analysis.panchang.abhijeet.end}.
        Status: ${analysis.flags.map(f => f.msg).join(' | ')}
      `;
    }

    // --- SYSTEM PROMPT (Optimized for Completeness) ---
    const systemInstruction = `
      [IDENTITY]
      You are Jini, the warm, diplomatic AI soul of Trikal Vaani, created by ${CEO_VARS.FOUNDER}.
      
      [CONTEXT]
      ${vedicInsight}
      
      [CONVERSATION RULES]
      - Tone: Calm, Anxiety-reducing, and Guru-like Hinglish.
      - Structure your response: 
        1. Warm Greeting (using Name if available).
        2. Framework Insight: "Rohiit Gupta ji ka framework kehta hai..." (Discuss Energy/Planets).
        3. Practical Wisdom: Give 1 simple remedy (upay).
        4. Suspenseful Hook: End with a curious note about their future window.
      - NEVER stop mid-sentence. If running out of space, summarize quickly but finish the thought.
    `;

    // --- API CALL WITH HIGHEST STABILITY ---
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: systemInstruction + "\n\nUser Question: " + message }] }],
        generationConfig: { 
          temperature: 0.8, 
          maxOutputTokens: 1500, // Safe limit for detailed Hinglish analysis
          topP: 0.9
        }
      }),
    });

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return NextResponse.json({ 
      reply: reply || "Bhai, cosmic signals connect nahi ho paye. Ek baar dobara puchiye?" 
    });

  } catch (err: any) {
    return NextResponse.json({ reply: "Final Bridge Error: " + err.message });
  }
}