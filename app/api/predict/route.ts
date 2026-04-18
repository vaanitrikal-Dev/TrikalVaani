import { NextRequest, NextResponse } from 'next/server';

const PROKERALA_CLIENT_ID = process.env.PROKERALA_CLIENT_ID ?? '';
const PROKERALA_CLIENT_SECRET = process.env.PROKERALA_CLIENT_SECRET ?? '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

async function getProkeralaToken(): Promise<string | null> {
  if (!PROKERALA_CLIENT_ID || !PROKERALA_CLIENT_SECRET) return null;
  try {
    const res = await fetch('https://api.prokerala.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: PROKERALA_CLIENT_ID,
        client_secret: PROKERALA_CLIENT_SECRET,
      }),
    });
    const data = await res.json();
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

async function fetchProkeralaChart(
  token: string,
  dob: string,
  birthTime: string,
  lat: number,
  lng: number
): Promise<Record<string, unknown> | null> {
  try {
    const datetime = `${dob}T${birthTime || '12:00'}:00+05:30`;
    const url = new URL('https://api.prokerala.com/v2/astrology/kundli');
    url.searchParams.set('datetime', datetime);
    url.searchParams.set('coordinates', `${lat},${lng}`);
    url.searchParams.set('ayanamsa', '1');

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function buildJiniSystemPrompt(
  segment: string,
  person1: Record<string, unknown>,
  person2: Record<string, unknown> | null,
  chartData: Record<string, unknown> | null,
  chartData2: Record<string, unknown> | null
): string {
  const hasChart = chartData !== null;
  const chartSummary = hasChart
    ? `
PROKERALA CHART DATA (Person 1):
${JSON.stringify(chartData, null, 2).slice(0, 3000)}
${
  chartData2
    ? `\nPROKERALA CHART DATA (Person 2):\n${JSON.stringify(chartData2, null, 2).slice(0, 3000)}`
    : ''
}
`
    : `No Prokerala API key configured — use Vedic principles based on DOB ${String(person1.dob)}.`;

  const dualContext =
    person2
      ? `
DUAL CHART ANALYSIS:
Person 1: ${JSON.stringify(person1)}
Person 2: ${JSON.stringify(person2)}
`
      : `SINGLE CHART ANALYSIS:\nPerson: ${JSON.stringify(person1)}`;

  return `You are Jini — the AI soul of Trikal Vaani, a Vedic Astrology platform founded by Rohiit Gupta (Chief Vedic Architect).

JINI PERSONA:
- Diplomatic, warm, and anxiety-reducing in tone
- Blend English + Hindi phrases naturally (Hinglish) — e.g., "Aapka Mars bahut strong hai"
- Always end with a 'Curiosity Suspense' hook — a compelling unanswered question or tease
- Never predict doom; frame challenges as karmic opportunities
- Cite specific planetary placements (Lagna, Rashi, Nakshatra, current Dasha) from the chart data
- For Ex-Back: give a CLOSURE VERDICT ("Wait & Reconnect" or "Accept & Move On") with clear reasoning
- For Toxic Boss: give specific Green Flags and Red Flags as a grid

QUESTION / SEGMENT: ${segment}

${dualContext}

${chartSummary}

RESPONSE STRUCTURE (JSON):
{
  "insight": "3–4 sentence Vedic insight in Jini's voice",
  "closureVerdict": "Wait & Reconnect | Accept & Move On | null",
  "reunionProbability": 0-100 or null,
  "reunionMonth": "e.g. September 2026 or null",
  "flags": [
    { "type": "green|red", "label": "Flag title", "detail": "Brief detail" }
  ],
  "upay": ["Remedy 1", "Remedy 2", "Remedy 3"],
  "jinitip": "1-line Hinglish Jini tip",
  "curiosityHook": "Ending suspense question to keep seeker engaged",
  "planetaryBasis": "Which specific planets/degrees/dashas drive this reading"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      segment,
      person1,
      person2 = null,
    } = body as {
      segment: string;
      person1: Record<string, unknown>;
      person2?: Record<string, unknown> | null;
    };

    if (!segment || !person1) {
      return NextResponse.json({ error: 'Missing segment or person1' }, { status: 400 });
    }

    let chartData: Record<string, unknown> | null = null;
    let chartData2: Record<string, unknown> | null = null;

    if (PROKERALA_CLIENT_ID && PROKERALA_CLIENT_SECRET) {
      const token = await getProkeralaToken();
      if (token) {
        const lat = (person1.lat as number) ?? 28.6139;
        const lng = (person1.lng as number) ?? 77.2090;
        chartData = await fetchProkeralaChart(
          token,
          String(person1.dob),
          String(person1.birth_time ?? '12:00'),
          lat,
          lng
        );

        if (person2) {
          const lat2 = (person2.lat as number) ?? 28.6139;
          const lng2 = (person2.lng as number) ?? 77.2090;
          chartData2 = await fetchProkeralaChart(
            token,
            String(person2.dob),
            String(person2.birth_time ?? '12:00'),
            lat2,
            lng2
          );
        }
      }
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured', chartData },
        { status: 503 }
      );
    }

    const systemPrompt = buildJiniSystemPrompt(segment, person1, person2, chartData, chartData2);

    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 1200,
          responseMimeType: 'application/json',
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        ],
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return NextResponse.json({ error: 'Gemini API error', detail: errText }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { insight: rawText };
    }

    return NextResponse.json({
      success: true,
      segment,
      prokerala: chartData !== null,
      analysis: parsed,
    });
  } catch (err) {
    console.error('[predict route]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
