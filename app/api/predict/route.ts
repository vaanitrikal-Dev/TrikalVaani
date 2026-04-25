/**
 * ============================================================
 * TRIKAL VAANI — Unified Prediction Endpoint
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/predict/route.ts
 * VERSION: 2.1-MASTER-FORCE (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * v2.1 CHANGES (over v2.0):
 *   - Fixed: tier lookup now uses 'profiles' table (not 'users')
 *   - profiles table is the public user data table in this project
 *   - auth.users is Supabase internal — not queried directly
 * ============================================================
 */

import { NextRequest, NextResponse }   from 'next/server';
import { createClient }                from '@supabase/supabase-js';
import { buildKundaliFromProkerala }   from '@/lib/prokerala';
import { buildKundali }                from '@/lib/swiss-ephemeris';
import { getDomainConfig }             from '@/lib/domain-config';
import { buildPredictionPrompt }       from '@/lib/gemini-prompt';
import type { BirthData }             from '@/lib/swiss-ephemeris';
import type { DomainId }              from '@/lib/domain-config';
import type { UserTier, UserContext }  from '@/lib/gemini-prompt';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY        ?? '';
const GEMINI_MODEL   = 'gemini-2.5-flash';
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_TOKENS: Record<UserTier, number> = {
  free:    4096,
  basic:   8192,
  pro:     8192,
  premium: 8192,
};

// Service role client — server-side only
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── REQUEST SHAPE ────────────────────────────────────────────────────────────
interface PredictRequest {
  userId?:    string;     // Supabase Auth user ID — optional for anonymous
  sessionId:  string;     // always required — generated client-side
  domainId:   DomainId;
  birthData:  BirthData;
  userContext: {
    segment:       'genz' | 'millennial' | 'genx';
    employment:    string;
    sector:        string;
    language:      'hindi' | 'hinglish' | 'english';
    city?:         string;
    businessName?: string;
    linkedinUrl?:  string;
    person2Name?:  string;
    person2City?:  string;
  };
}

// ─── TIER FETCHER — from profiles table ──────────────────────────────────────
async function getVerifiedTier(userId: string): Promise<UserTier> {
  try {
    const { data, error } = await supabase
      .from('profiles')              // ← profiles table, not users
      .select('tier, tier_expires_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn(`[TV-Predict] Tier fetch failed for ${userId} — defaulting to free`);
      return 'free';
    }

    // Check expiry
    if (data.tier_expires_at) {
      const expiresAt = new Date(data.tier_expires_at);
      if (expiresAt < new Date()) {
        console.info(`[TV-Predict] Tier expired for ${userId} — reverting to free`);
        return 'free';
      }
    }

    const validTiers: UserTier[] = ['free', 'basic', 'pro', 'premium'];
    const tier = data.tier as UserTier;
    if (!validTiers.includes(tier)) return 'free';

    return tier;

  } catch (err) {
    console.error('[TV-Predict] Supabase tier error:', err);
    return 'free';
  }
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json() as PredictRequest;
    const { userId, sessionId, domainId, birthData, userContext } = body;

    // ── Validate ─────────────────────────────────────────────────────────────
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }
    if (!domainId) {
      return NextResponse.json({ error: 'domainId required' }, { status: 400 });
    }
    if (!birthData?.dob) {
      return NextResponse.json({ error: 'birthData.dob required' }, { status: 400 });
    }
    if (!birthData?.lat || !birthData?.lng) {
      return NextResponse.json({ error: 'birthData.lat and lng required' }, { status: 400 });
    }
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Prediction engine not configured' }, { status: 500 });
    }

    // ── Verify tier from profiles ─────────────────────────────────────────────
    const verifiedTier = userId
      ? await getVerifiedTier(userId)
      : 'free';  // anonymous users always get free tier

    console.log(`[TV-Predict] Session: ${sessionId} | Tier: ${verifiedTier} | Domain: ${domainId}`);

    // ── Validate domain ───────────────────────────────────────────────────────
    let domain;
    try {
      domain = getDomainConfig(domainId);
    } catch {
      return NextResponse.json({ error: `Unknown domainId: ${domainId}` }, { status: 400 });
    }

    // ── Build Kundali ─────────────────────────────────────────────────────────
    let kundali;
    let chartSource = 'prokerala_swiss_ephemeris';

    try {
      kundali = await buildKundaliFromProkerala(birthData);
    } catch (err) {
      console.warn('[TV-Predict] Prokerala failed — Meeus fallback:', err);
      try {
        kundali     = buildKundali(birthData);
        chartSource = 'meeus_fallback';
      } catch (meusErr) {
        console.error('[TV-Predict] Both engines failed:', meusErr);
        return NextResponse.json(
          { error: 'Chart calculation failed. Check birth data.' },
          { status: 502 }
        );
      }
    }

    // ── Build verified user context ───────────────────────────────────────────
    const verifiedUserContext: UserContext = {
      tier:         verifiedTier,
      segment:      userContext.segment      || 'millennial',
      employment:   userContext.employment   || '',
      sector:       userContext.sector       || '',
      language:     userContext.language     || 'hinglish',
      city:         userContext.city         || birthData.cityName || 'India',
      businessName: userContext.businessName || undefined,
      linkedinUrl:  userContext.linkedinUrl  || undefined,
      person2Name:  userContext.person2Name  || undefined,
      person2City:  userContext.person2City  || undefined,
    };

    // ── Build Gemini prompt ───────────────────────────────────────────────────
    const { systemPrompt, userMessage, useSearch } = buildPredictionPrompt(
      kundali,
      birthData,
      domain,
      verifiedUserContext,
    );

    // ── Call Gemini ───────────────────────────────────────────────────────────
    const geminiBody: Record<string, unknown> = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents:           [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: {
        temperature:      0.4,
        maxOutputTokens:  MAX_TOKENS[verifiedTier],
        topP:             0.85,
        responseMimeType: 'application/json',
      },
    };

    if (useSearch) {
      geminiBody['tools'] = [{ googleSearch: {} }];
    }

    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(geminiBody),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error(`[TV-Predict] Gemini HTTP ${geminiRes.status}:`, errText.slice(0, 300));
      return NextResponse.json({ error: 'Prediction engine unavailable' }, { status: 502 });
    }

    const geminiData = await geminiRes.json();

    if (geminiData.error) {
      console.error('[TV-Predict] Gemini error:', geminiData.error);
      return NextResponse.json({ error: 'Prediction engine error' }, { status: 502 });
    }

    const rawText = geminiData?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? '')
      .join('') ?? '';

    if (!rawText) {
      return NextResponse.json({ error: 'Empty prediction response' }, { status: 502 });
    }

    // ── Parse JSON ────────────────────────────────────────────────────────────
    let prediction: Record<string, unknown>;
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/,      '')
        .replace(/```\s*$/,      '')
        .trim();
      prediction = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('[TV-Predict] JSON parse failed:', parseErr);
      console.error('[TV-Predict] Raw (500):', rawText.slice(0, 500));
      return NextResponse.json({ error: 'Invalid prediction format. Please retry.' }, { status: 502 });
    }

    const processingMs = Date.now() - startTime;

    // ── Return — include metadata for BirthForm to save to Supabase ──────────
    // BirthForm calls savePrediction() after receiving this response
    return NextResponse.json({
      ...prediction,
      _meta: {
        domainId,
        tier:        verifiedTier,
        chartSource,
        model:       GEMINI_MODEL,
        searchUsed:  useSearch,
        processingMs,
        // Kundali summary — BirthForm uses these for the predictions table
        kundali: {
          lagna:      kundali.lagna,
          nakshatra:  kundali.nakshatra,
          mahadasha:  kundali.currentMahadasha.lord,
          antardasha: kundali.currentAntardasha.lord,
        },
      },
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[TV-Predict] Unhandled:', msg);
    return NextResponse.json(
      { error: 'Cosmic disturbance. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status:  'operational',
    engine:  'Trikal Vaani Predict v2.1',
    model:   GEMINI_MODEL,
    domains: 11,
    tiers:   ['free', 'basic', 'pro', 'premium'],
    message: 'POST with sessionId + domainId + birthData + userContext',
  });
}
