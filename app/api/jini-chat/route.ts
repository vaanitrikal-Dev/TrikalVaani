import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

const EEAT_HEADER = 'Rohiit Gupta Vedic Engine — 10+ years Vedic research, AI-Vedic pioneer, Trikal Vaani';

const CACHED_TRANSIT = {
  sunSign: 'Aries',
  moonSign: 'Taurus',
  muhuratStatus: 'Shubh — Jupiter transit active',
  dardContext: null,
};

const JINI_PERSONA = `[${EEAT_HEADER}]

You are Jini — the warm, wise, and witty AI soul of Trikal Vaani, created by Rohiit Gupta.

IDENTITY:
- Platform: Trikal Vaani — World's Most Accurate AI Vedic Astrology Platform
- Founder: Rohiit Gupta, Chief Vedic Architect (10+ years Vedic research, AI-Vedic pioneer)
- Your role: First-line cosmic guide — empathetic, insightful, never alarmist

CRITICAL DATA RULES:
- If Sun Sign, Moon Sign, or birth details are null or missing, DO NOT say "signals slow" or give a generic error.
- Instead, warmly ask: "Aapka Birth City aur Birth Time share karein — ussi se main aapka exact planetary picture dekh sakti hoon!"
- If astroContext is null, use the cached transit data as a general reference and still give a helpful Vedic insight.
- NEVER say "cosmic signals slow" — always redirect to asking for birth details.

PERSONA RULES:
- Speak Hinglish naturally — blend English and Hindi (e.g., "Aapka Mars bahut strong hai — career mein chamak aa rahi hai")
- Be warm, reassuring, and anxiety-reducing. NEVER predict doom or catastrophe
- Keep responses concise in chat: 2–4 sentences unless the user asks for depth
- Always end with a gentle curiosity hook or open question to continue the conversation
- Reference specific planetary energies, current Dasha phase, or Nakshatra when relevant
- Never give medical, legal, or financial advice — suggest professional consultation
- Attribute deep insights to: "Rohiit Gupta ji ka framework kehta hai..."

VEDIC KNOWLEDGE:
- Parashara Vedic Astrology (Brihat Parashara Hora Shastra)
- 27 Nakshatras, 9 Navagraha, 12 Bhavas
- Vimshottari Dasha system (120-year planetary cycle)
- Trikal Vaani specialties: Ex-Back Closure (Dard Engine), Toxic Boss Radar, Manifestation windows, Career pivots, Wealth Yogas
- Trikal = Bhoot (Past), Vartaman (Present), Bhavisya (Future)

DARD ENGINE CONTEXT (if dardContext is set):
- ex_back: Focus on Venus-Ketu axis, 7th house karma, reunion probability, emotional closure
- toxic_boss: Focus on Saturn-Mars tension, 10th house karma, professional liberation timing
- manifestation: Focus on 11th house activation, Jupiter transit, Sankalpa window

TONE EXAMPLES:
- "Venus aur Moon ka sync iss waqt bahut strong hai — connection mein naya chapter shuru ho sakta hai!"
- "Saturn ka 7th house transit thoda challenging zaroor hai, lekin yeh transformation ka signal bhi hai."
- "Aapka Rahu is saal career mein bada push de raha hai — kya aap ready hain?"`;

type HistoryMsg = {
  role: 'user' | 'jini';
  text: string;
};

type AstroContext = {
  sunSign?: string | null;
  moonSign?: string | null;
  muhuratStatus?: string | null;
  dardContext?: string | null;
  name?: string | null;
  dob?: string | null;
  city?: string | null;
  energyScore?: number | null;
} | null;

export async function POST(req: NextRequest) {
  try {
    const engineHeader = req.headers.get('X-Vedic-Engine');
    console.log(`[Jini Chat] Vedic Engine: ${engineHeader ?? 'not set'}`);

    const body = await req.json() as {
      message: string;
      userName?: string | null;
      history?: HistoryMsg[];
      astroContext?: AstroContext;
    };

    const { message, userName, history = [], astroContext = null } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    console.log(`[Jini Chat] Request from: ${userName ?? 'anonymous'}, history: ${history.length}, hasContext: ${!!astroContext}`);

    if (!GEMINI_API_KEY) {
      console.warn('[Jini Chat] GEMINI_API_KEY not configured — returning fallback');
      return NextResponse.json({
        reply: `Namaste${userName ? ', ' + userName : ''}! Main Jini hoon — Trikal Vaani ki AI soul. Kya aap apna Birth City aur Birth Time share karein? Ussi se main aapki exact Vedic picture dekh sakti hoon!`,
      });
    }

    const ctx = astroContext ?? CACHED_TRANSIT;
    const hasBirthData = !!(ctx.sunSign || ctx.moonSign || astroContext?.dob);

    const contextBlock = `
ROHIIT GUPTA VEDIC ENGINE — CURRENT USER ASTRO SNAPSHOT:
- Sun Sign: ${ctx.sunSign ?? 'Unknown — ask for birth details'}
- Moon Sign: ${ctx.moonSign ?? 'Unknown — ask for birth details'}
- Muhurat Status: ${ctx.muhuratStatus ?? 'General — Jupiter transit active (cached)'}
- Dard Context: ${ctx.dardContext ?? 'None — general reading'}
${astroContext?.name ? `- Name: ${astroContext.name}` : ''}
${astroContext?.dob ? `- DOB: ${astroContext.dob}` : ''}
${astroContext?.city ? `- City: ${astroContext.city}` : ''}
${astroContext?.energyScore != null ? `- Energy Score: ${astroContext.energyScore}` : ''}
${!hasBirthData ? '\nDATA STATUS: Birth details not yet provided. If the question requires specific planetary analysis, ask for Birth City and Birth Time before answering.' : '\nDATA STATUS: Partial birth data available — give specific insights where possible.'}
${!astroContext ? '\nNOTE: Using cached general transit data. Encourage user to run their free reading for personalized analysis.' : ''}`;

    const systemInstruction = JINI_PERSONA
      + (userName ? `\n\nThe user's name is ${userName}. Address them personally.` : '')
      + contextBlock;

    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [
      {
        role: 'user',
        parts: [{ text: systemInstruction + '\n\n[Conversation begins. Respond ONLY as Jini from this point.]' }],
      },
      {
        role: 'model',
        parts: [{ text: `Namaste${userName ? ', ' + userName : ''}! Main Jini hoon — Trikal Vaani ki AI soul, Rohiit Gupta ji ki creation. Aapki cosmic journey mein swagat hai! Kya poochna chahte hain aaj?` }],
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

    const geminiController = new AbortController();
    const geminiTimeout = setTimeout(() => geminiController.abort(), 9000);

    let res: Response;
    try {
      res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        signal: geminiController.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Vedic-Engine': EEAT_HEADER,
        },
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
    } finally {
      clearTimeout(geminiTimeout);
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Jini Chat] Gemini FAIL — status ${res.status}: ${errText.slice(0, 300)}`);
      return NextResponse.json({
        reply: hasBirthData
          ? 'Aapka sawaal sun liya — thodi si cosmic re-alignment ho rahi hai. Ek baar phir try karein!'
          : 'Jini yahan hai! Accurate reading ke liye aapka Birth City aur Birth Time chahiye. Kya share kar sakte hain?',
      });
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!reply) {
      console.error(`[Jini Chat] Gemini empty response — full: ${JSON.stringify(data).slice(0, 300)}`);
      return NextResponse.json({
        reply: 'Thoda aur batao — main sun rahi hoon! Apna Birth City ya sawaal detail mein share karein.',
      });
    }

    console.log(`[Jini Chat] Gemini SUCCESS — reply length: ${reply.length}`);
    return NextResponse.json({ reply });
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    console.error(`[Jini Chat] ${isTimeout ? 'TIMEOUT' : 'Exception'}: ${err}`);
    return NextResponse.json({
      reply: isTimeout
        ? 'Thodi network delay aayi — lekin main yahan hoon! Apna Birth City aur Birth Time share karein for a personalized reading.'
        : 'Ek second — cosmic thread reconnect ho rahi hai. Dobara try karein!',
    });
  }
}
