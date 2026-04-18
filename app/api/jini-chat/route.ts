import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

const JINI_PERSONA = `You are Jini — the warm, wise, and witty AI soul of Trikal Vaani.

IDENTITY:
- Platform: Trikal Vaani — World's Most Accurate AI Vedic Astrology Platform
- Founder: Rohiit Gupta, Chief Vedic Architect (10+ years Vedic research, AI-Vedic pioneer)
- Your role: First-line cosmic guide — empathetic, insightful, never alarmist

PERSONA RULES:
- Speak Hinglish naturally — blend English and Hindi (e.g., "Aapka Mars bahut strong hai — career mein chamak aa rahi hai")
- Be warm, reassuring, and anxiety-reducing. NEVER predict doom or catastrophe
- Keep responses concise in chat: 2–4 sentences unless the user asks for depth
- Always end with a gentle curiosity hook or open question to continue the conversation
- Reference specific planetary energies, current Dasha phase, or Nakshatra when relevant
- If you lack specific birth details, politely ask for them
- Never give medical, legal, or financial advice — suggest professional consultation
- Attribute deep insights to: "Rohiit Gupta ji ka framework kehta hai..."

VEDIC KNOWLEDGE:
- Parashara Vedic Astrology (Brihat Parashara Hora Shastra)
- 27 Nakshatras, 9 Navagraha, 12 Bhavas
- Vimshottari Dasha system (120-year planetary cycle)
- Trikal Vaani specialties: Ex-Back Closure, Toxic Boss Radar, Manifestation windows, Career pivots, Wealth Yogas
- Trikal = Bhoot (Past), Vartaman (Present), Bhavisya (Future)

TONE EXAMPLES:
- "Venus aur Moon ka sync iss waqt bahut strong hai — connection mein naya chapter shuru ho sakta hai!"
- "Saturn ka 7th house transit thoda challenging zaroor hai, lekin yeh transformation ka signal bhi hai."
- "Aapka Rahu is saal career mein bada push de raha hai — kya aap ready hain?"`;

type HistoryMsg = {
  role: 'user' | 'jini';
  text: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      message: string;
      userName?: string | null;
      history?: HistoryMsg[];
      lastPrediction?: Record<string, unknown> | null;
    };

    const { message, userName, history = [], lastPrediction = null } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    console.log(`[Jini Chat] Request from user: ${userName ?? 'anonymous'}, history length: ${history.length}`);

    if (!GEMINI_API_KEY) {
      console.warn('[Jini Chat] GEMINI_API_KEY not configured — returning fallback');
      const fallback = `Namaste${userName ? ', ' + userName : ''}! Main Jini hoon — Trikal Vaani ki AI soul. Abhi cosmic connection configure ho rahi hai. Thodi der mein poori Vedic power active ho jaayegi! Kya aap apna jawab thoda wait kar sakte hain?`;
      return NextResponse.json({ reply: fallback });
    }

    let predictionContext = '';
    if (lastPrediction && typeof lastPrediction === 'object') {
      const p = lastPrediction as Record<string, unknown>;
      const parts: string[] = [];
      if (p.segment) parts.push(`Segment: ${p.segment}`);
      if (p.name) parts.push(`Name: ${p.name}`);
      if (p.dob) parts.push(`DOB: ${p.dob}`);
      if (p.city) parts.push(`City: ${p.city}`);
      if (p.energyScore) parts.push(`Energy Score: ${p.energyScore}`);
      if (p.insight) parts.push(`Last Insight: ${String(p.insight).slice(0, 300)}`);
      if (parts.length > 0) {
        predictionContext = `\n\nUSER'S LAST PREDICTION CONTEXT:\n${parts.join('\n')}`;
      }
    }

    const systemInstruction = JINI_PERSONA
      + (userName ? `\n\nThe user's name is ${userName}. Address them personally.` : '')
      + predictionContext;

    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [
      {
        role: 'user',
        parts: [{ text: systemInstruction + '\n\n[Conversation begins. Respond ONLY as Jini from this point.]' }],
      },
      {
        role: 'model',
        parts: [{ text: `Namaste${userName ? ', ' + userName : ''}! Main Jini hoon — Trikal Vaani ki AI soul. Aapki cosmic journey mein swagat hai! Kya poochna chahte hain aaj?` }],
      },
    ];

    for (const msg of history.slice(-10)) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.82,
          maxOutputTokens: 250,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Jini Chat] Gemini FAIL — status ${res.status}: ${errText.slice(0, 200)}`);
      return NextResponse.json(
        { reply: 'Cosmic signals thodi slow hain abhi. Ek baar phir try karein!' },
        { status: 200 }
      );
    }

    const data = await res.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
      'Aapka sawaal sun liya. Thodi si cosmic energy gather ho rahi hai — dobara poochiye!';

    console.log(`[Jini Chat] Gemini SUCCESS — reply length: ${reply.length}`);

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[Jini Chat] Exception:', err);
    return NextResponse.json(
      { reply: 'Kuch cosmic interference aayi. Thodi der baad try karein.' },
      { status: 200 }
    );
  }
}
