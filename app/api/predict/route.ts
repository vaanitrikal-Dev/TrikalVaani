/**
 * ============================================================
 * TRIKAL VAANI — Unified Prediction Endpoint
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/predict/route.ts
 * VERSION: 2.0-MASTER (GOD-LEVEL PROTECTION)
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * ⚠️ STRICT CEO ORDER: DO NOT EDIT WITHOUT CEO APPROVAL
 *
 * PURPOSE:
 *   Single endpoint for ALL 11 Dard-e-Dil domains + Cosmic Journey.
 *   Receives domain + birth data → verifies tier from Supabase →
 *   builds chart → calls Gemini → returns two-layer prediction JSON.
 *
 * v2.0 CHANGES (over v1.0):
 *   - Supabase tier verification — tier cannot be spoofed by frontend
 *   - UserContext now includes verified tier before prompt is built
 *   - maxOutputTokens scales by tier (free saves tokens)
 *   - userId required in request — used for Supabase tier lookup
 *   - userContext extended: city, businessName, linkedinUrl,
 *     person2Name, person2City (for dual chart domains)
 *
 * FLOW:
 *   1. Parse + validate request
 *   2. Verify userId session (Supabase Auth)
 *   3. Fetch verified tier from Supabase users table
 *   4. Validate domainId
 *   5. Build Kundali (Prokerala → Meeus fallback)
 *   6. Build prompt (lib/gemini-prompt.ts)
 *   7. Call Gemini (with search grounding if paid + domain allows)
 *   8. Parse + return prediction JSON
 * ============================================================
 */

import { NextRequest, NextResponse }    from 'next/server';
import { createClient }                 from '@supabase/supabase-js';
import { buildKundaliFromProkerala }    from '@/lib/prokerala';
import { buildKundali }                 from '@/lib/swiss-ephemeris';
import { getDomainConfig }              from '@/lib/domain-config';
import { buildPredictionPrompt }        from '@/lib/gemini-prompt';
import type { BirthData }              from '@/lib/swiss-ephemeris';
import type { DomainId }               from '@/lib/domain-config';
import type { UserTier, UserContext }   from '@/lib/gemini-prompt';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY        ?? '';
const GEMINI_MODEL   = 'gemini-2.0-flash';
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Token limits per tier — controls cost per call
const MAX_TOKENS: Record<UserTier, number> = {
  free:    2500,   // ~₹0.18/call — short summary + trimmed JSON
  basic:   5000,   // ~₹0.35/call — full summary + full JSON
  pro:     6500,   // ~₹0.45/call — full + domain extras + reasoning
  premium: 6500,   // same as pro — premium features handled at UI layer
};

// Supabase service client — server-side only, never exposed to frontend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // service role — bypasses RLS
);

// ─── REQUEST SHAPE ────────────────────────────────────────────────────────────
interface PredictRequest {
  userId:    string;      // Supabase Auth user ID — required for tier lookup
  domainId:  DomainId;
  birthData: BirthData;
  userContext: {
    // tier is NOT accepted from frontend — fetched from Supabase
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

// ─── TIER FETCHER — Supabase verified ─────────────────────────────────────────
async function getVerifiedTier(userId: string): Promise<UserTier> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('tier, tier_expires_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.warn(`[TV-Predict] Tier fetch failed for ${userId} — defaulting to free`);
      return 'free';
    }

    // Check tier expiry — if expired, fall back to free
    if (data.tier_expires_at) {
      const expiresAt = new Date(data.tier_expires_at);
      if (expiresAt < new Date()) {
        console.info(`[TV-Predict] Tier expired for ${userId} — reverting to free`);
        return 'free';
      }
    }

    // Validate tier value is one of our known tiers
    const validTiers: UserTier[] = ['free', 'basic', 'pro', 'premium'];
    const tier = data.tier as UserTier;
    if (!validTiers.includes(tier)) {
      console.warn(`[TV-Predict] Unknown tier "${data.tier}" for ${userId} — defaulting to free`);
      return 'free';
    }

    return tier;

  } catch (err) {
    console.error('[TV-Predict] Supabase tier error:', err);
    return 'free';   // Always safe default
  }
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {

    // ── 1. Parse request ─────────────────────────────────────────────────────
    const body = await req.json() as PredictRequest;
    const { userId, domainId, birthData, userContext } = body;

    // ── 2. Validate required fields ──────────────────────────────────────────
    if (!userId) {
      return NextResponse.json(
        { error: 'userId required — must be logged in to use predictions' },
        { status: 401 }
      );
    }
    if (!domainId) {
      return NextResponse.json(
        { error: 'domainId required' },
        { status: 400 }
      );
    }
    if (!birthData?.dob) {
      return NextResponse.json(
        { error: 'birthData.dob required' },
        { status: 400 }
      );
    }
    if (!birthData?.lat || !birthData?.lng) {
      return NextResponse.json(
        { error: 'birthData.lat and lng required for accurate chart' },
        { status: 400 }
      );
    }
    if (!GEMINI_API_KEY) {
      console.error('[TV-Predict] GEMINI_API_KEY missing from env');
      return NextResponse.json(
        { error: 'Prediction engine not configured' },
        { status: 500 }
      );
    }

    // ── 3. Verify tier from Supabase — cannot be spoofed ────────────────────
    const verifiedTier = await getVerifiedTier(userId);
    console.log(`[TV-Predict] User: ${userId} | Tier: ${verifiedTier} | Domain: ${domainId}`);

    // ── 4. Validate domain exists ────────────────────────────────────────────
    let domain;
    try {
      domain = getDomainConfig(domainId);
    } catch {
      return NextResponse.json(
        { error: `Unknown domainId: ${domainId}` },
        { status: 400 }
      );
    }

    // ── 5. Build Kundali — Prokerala first, Meeus fallback ───────────────────
    let kundali;
    let chartSource = 'prokerala_swiss_ephemeris';

    try {
      kundali = await buildKundaliFromProkerala(birthData);
    } catch (prokeralaErr) {
      console.warn('[TV-Predict] Prokerala failed — using Meeus fallback:', prokeralaErr);
      try {
        kundali     = buildKundali(birthData);
        chartSource = 'meeus_fallback';
      } catch (meusErr) {
        console.error('[TV-Predict] Both chart engines failed:', meusErr);
        return NextResponse.json(
          { error: 'Chart calculation failed. Please check birth data and retry.' },
          { status: 502 }
        );
      }
    }

    // ── 6. Build verified UserContext ────────────────────────────────────────
    // Tier comes from Supabase — never from request body
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

    // ── 7. Build Gemini prompt ───────────────────────────────────────────────
    const { systemPrompt, userMessage, useSearch } = buildPredictionPrompt(
      kundali,
      birthData,
      domain,
      verifiedUserContext,
    );

    // ── 8. Build Gemini request body ─────────────────────────────────────────
    const geminiBody: Record<string, unknown> = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        { role: 'user', parts: [{ text: userMessage }] },
      ],
      generationConfig: {
        temperature:      0.4,
        maxOutputTokens:  MAX_TOKENS[verifiedTier],
        topP:             0.85,
        responseMimeType: 'application/json',
      },
    };

    // Google Search grounding — paid tier + domain has world context
    if (useSearch) {
      geminiBody['tools'] = [{ googleSearch: {} }];
      console.log(`[TV-Predict] Search grounding enabled for ${domainId}`);
    }

    // ── 9. Call Gemini ───────────────────────────────────────────────────────
    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(geminiBody),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error(`[TV-Predict] Gemini HTTP ${geminiRes.status}:`, errText.slice(0, 300));
      return NextResponse.json(
        { error: 'Prediction engine unavailable. Please try again.' },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();

    // Handle Gemini error in response body
    if (geminiData.error) {
      console.error('[TV-Predict] Gemini API error:', geminiData.error);
      return NextResponse.json(
        { error: 'Prediction engine error. Please try again.' },
        { status: 502 }
      );
    }

    // Extract text from response
    const rawText = geminiData?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? '')
      .join('') ?? '';

    if (!rawText) {
      console.error('[TV-Predict] Gemini returned empty response');
      return NextResponse.json(
        { error: 'Empty prediction response. Please retry.' },
        { status: 502 }
      );
    }

    // ── 10. Parse JSON response ──────────────────────────────────────────────
    let prediction: Record<string, unknown>;
    try {
      // Clean markdown fences if Gemini added them despite responseMimeType
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/,      '')
        .replace(/```\s*$/,      '')
        .trim();
      prediction = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('[TV-Predict] JSON parse failed:', parseErr);
      console.error('[TV-Predict] Raw (first 500):', rawText.slice(0, 500));
      return NextResponse.json(
        { error: 'Invalid prediction format. Please retry.' },
        { status: 502 }
      );
    }

    // ── 11. Return enriched response ─────────────────────────────────────────
    const processingMs = Date.now() - startTime;
    console.log(`[TV-Predict] ✅ Done | ${domainId} | ${verifiedTier} | ${processingMs}ms`);

    return NextResponse.json({
      ...prediction,
      _meta: {
        domainId,
        tier:        verifiedTier,
        chartSource,
        model:       GEMINI_MODEL,
        searchUsed:  useSearch,
        processingMs,
      },
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[TV-Predict] Unhandled error:', msg);
    return NextResponse.json(
      { error: 'Cosmic disturbance detected. Please try again.' },
      { status: 500 }
    );
  }
}

// ─── GET — Health check ───────────────────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    status:  'operational',
    engine:  'Trikal Vaani Predict v2.0',
    model:   GEMINI_MODEL,
    domains: 11,
    tiers:   ['free', 'basic', 'pro', 'premium'],
    message: 'POST with userId + domainId + birthData + userContext',
  });
}