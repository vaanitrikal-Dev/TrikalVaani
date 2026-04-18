import { NextRequest, NextResponse } from 'next/server';

const PROKERALA_CLIENT_ID = process.env.PROKERALA_CLIENT_ID ?? '';
const PROKERALA_CLIENT_SECRET = process.env.PROKERALA_CLIENT_SECRET ?? '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

async function getProkeralaToken(): Promise<string | null> {
  if (!PROKERALA_CLIENT_ID || !PROKERALA_CLIENT_SECRET) {
    console.warn('[Prokerala] Credentials not configured — skipping chart fetch');
    return null;
  }
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
    if (data.access_token) {
      console.log('[Prokerala] Token fetch SUCCESS');
      return data.access_token;
    }
    console.error('[Prokerala] Token fetch FAIL — no access_token in response');
    return null;
  } catch (err) {
    console.error('[Prokerala] Token fetch FAIL — exception:', err);
    return null;
  }
}

async function fetchProkeralaChart(
  token: string,
  label: string,
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

    console.log(`[Prokerala] Fetching chart for ${label} — datetime: ${datetime}, coords: ${lat},${lng}`);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error(`[Prokerala] Chart fetch FAIL for ${label} — HTTP ${res.status}`);
      return null;
    }

    const data = await res.json();
    console.log(`[Prokerala] Chart fetch SUCCESS for ${label}`);
    return data;
  } catch (err) {
    console.error(`[Prokerala] Chart fetch FAIL for ${label} — exception:`, err);
    return null;
  }
}

type PlanetData = {
  name: string;
  sign: string;
  degree: number;
  house: number;
  nakshatra?: string;
  retrograde?: boolean;
};

function buildPlanetarySummary(chartData: Record<string, unknown>, label: string): string {
  const lines: string[] = [`=== ${label} — RAW PLANETARY DATA ===`];

  try {
    const data = (chartData?.data ?? chartData) as Record<string, unknown>;

    const ascendant = data?.ascendant as Record<string, unknown> | undefined;
    if (ascendant) {
      const sign = (ascendant?.rasi as Record<string, unknown>)?.name ?? ascendant?.sign ?? 'Unknown';
      const degree = ascendant?.degree ?? ascendant?.longitude ?? '?';
      lines.push(`Lagna (Ascendant): ${sign} at ${degree}°`);
    }

    const planets = (data?.planets ?? data?.planet_position) as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(planets) && planets.length > 0) {
      lines.push('Navagraha Positions:');
      for (const p of planets) {
        const planet = p as PlanetData & Record<string, unknown>;
        const name = p.name ?? p.planet ?? 'Unknown';
        const sign = (p.rasi as Record<string, unknown>)?.name ?? p.sign ?? p.rashi ?? '?';
        const degree = p.degree ?? p.longitude ?? '?';
        const house = p.house ?? p.house_number ?? '?';
        const nakshatra = (p.nakshatra as Record<string, unknown>)?.name ?? p.nakshatra ?? '';
        const retro = p.is_retrograde ?? p.retrograde ?? false;
        const retroStr = retro ? ' (R)' : '';
        const nakStr = nakshatra ? ` | Nakshatra: ${nakshatra}` : '';
        lines.push(`  ${name}: ${sign} ${degree}° | House ${house}${retroStr}${nakStr}`);
      }
    }

    const houses = (data?.houses ?? data?.bhava_chart) as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(houses) && houses.length > 0) {
      lines.push('House Cusps:');
      for (const h of houses.slice(0, 12)) {
        const num = h.house ?? h.number ?? '?';
        const sign = (h.rasi as Record<string, unknown>)?.name ?? h.sign ?? '?';
        const degree = h.degree ?? h.longitude ?? '?';
        lines.push(`  House ${num}: ${sign} ${degree}°`);
      }
    }

    const dasha = data?.dasha ?? data?.current_dasha;
    if (dasha && typeof dasha === 'object') {
      const d = dasha as Record<string, unknown>;
      const planet = d.planet ?? d.lord ?? d.mahadasha_planet ?? '?';
      const end = d.end_date ?? d.end ?? '?';
      lines.push(`Current Mahadasha: ${planet} (ends: ${end})`);
    }
  } catch (err) {
    lines.push(`[Parse error: ${err}]`);
  }

  return lines.join('\n');
}

function buildJiniSystemPrompt(
  segment: string,
  person1: Record<string, unknown>,
  person2: Record<string, unknown> | null,
  chartData: Record<string, unknown> | null,
  chartData2: Record<string, unknown> | null
): string {
  const hasChart = chartData !== null;

  let chartSummary: string;
  if (hasChart) {
    chartSummary = buildPlanetarySummary(chartData!, 'Person 1');
    if (chartData2) {
      chartSummary += '\n\n' + buildPlanetarySummary(chartData2, 'Person 2');
    }
  } else {
    chartSummary = `No Prokerala API key configured — use Vedic principles based on DOB ${String(person1.dob)}.`;
  }

  const dualContext =
    person2
      ? `DUAL CHART ANALYSIS:\nPerson 1: ${JSON.stringify(person1)}\nPerson 2: ${JSON.stringify(person2)}`
      : `SINGLE CHART ANALYSIS:\nPerson: ${JSON.stringify(person1)}`;

  return `You are Jini — the AI soul of Trikal Vaani, a Vedic Astrology platform founded by Rohiit Gupta (Chief Vedic Architect).

JINI PERSONA:
- Diplomatic, warm, and anxiety-reducing in tone
- Blend English + Hindi phrases naturally (Hinglish) — e.g., "Aapka Mars bahut strong hai"
- Always end with a 'Curiosity Suspense' hook — a compelling unanswered question or tease
- Never predict doom; frame challenges as karmic opportunities
- Cite specific planetary placements (Lagna, Rashi, Nakshatra, current Dasha) from the chart data below
- For Ex-Back: give a CLOSURE VERDICT ("Wait & Reconnect" or "Accept & Move On") with clear reasoning
- For Toxic Boss: give specific Green Flags and Red Flags as a grid

QUESTION / SEGMENT: ${segment}

${dualContext}

${chartSummary}

RESPONSE STRUCTURE (JSON):
{
  "insight": "3–4 sentence Vedic insight in Jini's voice citing specific planetary data",
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

    console.log(`[Predict] Request — segment: ${segment}, person1: ${JSON.stringify(person1).slice(0, 100)}, dual: ${!!person2}`);

    let chartData: Record<string, unknown> | null = null;
    let chartData2: Record<string, unknown> | null = null;

    if (PROKERALA_CLIENT_ID && PROKERALA_CLIENT_SECRET) {
      const token = await getProkeralaToken();
      if (token) {
        const lat = (person1.lat as number) ?? 28.6139;
        const lng = (person1.lng as number) ?? 77.2090;
        chartData = await fetchProkeralaChart(
          token,
          'Person 1',
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
            'Person 2',
            String(person2.dob),
            String(person2.birth_time ?? '12:00'),
            lat2,
            lng2
          );
        }
      }
    } else {
      console.log('[Prokerala] Skipped — no credentials. Using Gemini with DOB-only fallback.');
    }

    if (!GEMINI_API_KEY) {
      console.error('[Gemini] GEMINI_API_KEY not configured');
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured', chartData },
        { status: 503 }
      );
    }

    const systemPrompt = buildJiniSystemPrompt(segment, person1, person2, chartData, chartData2);

    console.log(`[Gemini] Sending request — prompt length: ${systemPrompt.length}`);

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
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error(`[Gemini] Response FAIL — HTTP ${geminiRes.status}: ${errText.slice(0, 300)}`);
      return NextResponse.json({ error: 'Gemini API error', detail: errText }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

    console.log(`[Gemini] Response SUCCESS — raw length: ${rawText.length}`);

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.warn('[Gemini] JSON parse failed — returning raw text as insight');
      parsed = { insight: rawText };
    }

    return NextResponse.json({
      success: true,
      segment,
      prokerala: chartData !== null,
      analysis: parsed,
    });
  } catch (err) {
    console.error('[Predict] Internal error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
