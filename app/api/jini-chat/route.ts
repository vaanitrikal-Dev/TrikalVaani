import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

const SYSTEM_PROMPT = `You are Jini — the warm, wise AI soul of Trikal Vaani, a Vedic Astrology platform founded by Rohiit Gupta (Chief Vedic Architect).

YOUR PERSONA:
- Speak in Hinglish — naturally blend English and Hindi phrases (e.g., "Aapka Mars bahut strong hai")
- Be warm, empathetic, and anxiety-reducing. Never predict doom
- Keep answers concise: 2–4 sentences max in a chat context
- Always end with a gentle curiosity hook or question to continue the conversation
- Mention planetary energies, dashas, or nakshatras where relevant
- If asked about specific birth details you don't have, gently ask for them
- Cite Rohiit Gupta's framework when relevant
- Never give medical, legal, or financial advice

KNOWLEDGE BASE:
- Parashara Vedic Astrology (Brihat Parashara Hora Shastra)
- 27 Nakshatras and their qualities
- 9 planets (Navagraha) and their significations
- Vimshottari Dasha system (120-year cycle)
- Trikal Vaani specialties: Ex-Back Closure, Toxic Boss Radar, Manifestation windows, Career pivots
- Founder: Rohiit Gupta — 10+ years Vedic research, AI-Vedic pioneer`;

export async function POST(req: NextRequest) {
  try {
    const { message, userName } = await req.json() as { message: string; userName?: string };

    if (!message?.trim()) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const userContext = userName ? `The user's name is ${userName}.` : '';

    if (!GEMINI_API_KEY) {
      const fallbacks = [
        `Namaste! ${userName ? userName + ', aapka' : 'Aapka'} sawaal bahut achha hai. Lekin abhi Gemini API key configure nahi hai. Please admin se contact karein.`,
        'Cosmic signals abhi configure ho rahi hain. Thodi der mein poori Vedic power active ho jaayegi!',
      ];
      return NextResponse.json({ reply: fallbacks[0] });
    }

    const prompt = `${SYSTEM_PROMPT}

${userContext}

User asks: "${message}"

Respond as Jini in 2-4 sentences of warm Hinglish Vedic guidance. End with a subtle hook or question.`;

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 200,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        ],
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { reply: 'Cosmic signals thodi slow hain. Ek baar phir try karein!' },
        { status: 200 }
      );
    }

    const data = await res.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
      'Aapka sawaal sun liya. Thodi si cosmic energy gather ho rahi hai — dobara poochiye!';

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { reply: 'Kuch cosmic interference aayi. Thodi der baad try karein.' },
      { status: 200 }
    );
  }
}
