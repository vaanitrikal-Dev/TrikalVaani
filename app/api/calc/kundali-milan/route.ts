/**
 * ============================================================
 * TRIKAL VAANI — Kundali Milan Compute API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/calc/kundali-milan/route.ts
 * VERSION: 1.1 — BUGFIX (Day 7)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * CHANGES v1.1 (BUGFIX):
 *   ✅ VM /milan-compute payload renamed:
 *        bride → person1
 *        groom → person2
 *      (Day 3 VM milan_engine.py expects person1/person2)
 *   ✅ Public API + response shape UNCHANGED (client still sends bride/groom)
 *   ✅ Only the internal VM call is fixed
 *
 * v1.0:
 *   Receives bride + groom birth data from KundaliMilanForm.tsx,
 *   calls VM endpoint and returns Milan data for the FREE preview tier.
 *
 * Anti-tamper: tier defaults to "free" here; paid tiers must
 * route via /api/create-milan-order + /api/verify-milan-payment.
 * ============================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ── VM endpoint ──────────────────────────────────────────────
const VM_MILAN_ENDPOINT =
  process.env.VM_MILAN_ENDPOINT ?? 'http://34.14.164.105:8001/milan-compute';

// ── Zod schema: per-partner birth data ───────────────────────
const partnerSchema = z.object({
  name:     z.string().trim().min(1, 'Name required').max(80),
  gender:   z.enum(['male', 'female']).optional(),
  dob:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD'),
  tob:      z.string().regex(/^\d{2}:\d{2}$/, 'TOB must be HH:MM'),
  place:    z.string().trim().min(1, 'Place required').max(160),
  latitude: z.number().min(-90).max(90),
  longitude:z.number().min(-180).max(180),
  timezone: z.number().min(-12).max(14),
});

// ── Zod schema: full request (client API stays bride/groom) ──
const requestSchema = z.object({
  bride:    partnerSchema,
  groom:    partnerSchema,
  audience: z.enum(['couple', 'parent', 'both']).default('couple'),
  language: z.enum(['hinglish', 'hindi', 'english']).default('hinglish'),
  tier:     z.literal('free').default('free'),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();

    // ── Validate ───────────────────────────────────────────
    const parsed = requestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid input.',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { bride, groom, audience, language } = parsed.data;

    // ── BUGFIX v1.1: VM expects person1/person2 ────────────
    const vmPayload = {
      person1: {
        name:      bride.name,
        gender:    bride.gender ?? 'female',
        year:      Number(bride.dob.slice(0, 4)),
        month:     Number(bride.dob.slice(5, 7)),
        day:       Number(bride.dob.slice(8, 10)),
        hour:      Number(bride.tob.slice(0, 2)),
        minute:    Number(bride.tob.slice(3, 5)),
        latitude:  bride.latitude,
        longitude: bride.longitude,
        timezone:  bride.timezone,
        place:     bride.place,
      },
      person2: {
        name:      groom.name,
        gender:    groom.gender ?? 'male',
        year:      Number(groom.dob.slice(0, 4)),
        month:     Number(groom.dob.slice(5, 7)),
        day:       Number(groom.dob.slice(8, 10)),
        hour:      Number(groom.tob.slice(0, 2)),
        minute:    Number(groom.tob.slice(3, 5)),
        latitude:  groom.latitude,
        longitude: groom.longitude,
        timezone:  groom.timezone,
        place:     groom.place,
      },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    let vmRes: Response;
    try {
      vmRes = await fetch(VM_MILAN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vmPayload),
        signal: controller.signal,
        cache: 'no-store',
      });
    } catch (e: unknown) {
      clearTimeout(timeout);
      console.error('[Trikal] VM /milan-compute fetch failed:', e);
      return NextResponse.json(
        { error: 'Milan engine unreachable. Please try again in a moment.' },
        { status: 502 }
      );
    }
    clearTimeout(timeout);

    if (!vmRes.ok) {
      const txt = await vmRes.text().catch(() => '');
      console.error('[Trikal] VM /milan-compute error:', vmRes.status, txt);
      return NextResponse.json(
        { error: 'Milan engine returned an error.' },
        { status: 502 }
      );
    }

    const vmData = await vmRes.json();

    // ── Build FREE preview response (anti-spoiler) ─────────
    // Free tier: ashtakoot score + manglik flag + 1 hook line
    // Paid tiers receive full ashtakoot_data, manglik_data,
    // remedies_data, gemini_narrative via /verify-milan-payment.
    const ashtakootScore = vmData?.ashtakoot?.total_score ?? null;
    const manglikStatus  = vmData?.manglik?.status ?? null;

    const previewHook =
      ashtakootScore !== null && ashtakootScore >= 18
        ? 'Aapki rishtedari mein Mahakaal ki rehmat dikhayi de rahi hai. Poori sachhai dekhne ke liye Deep Reading kholiye.'
        : 'Is rishtedari mein kuch chhupe huye sutra hain jo sirf Deep Reading mein khulenge.';

    return NextResponse.json({
      success:  true,
      tier:     'free',
      audience,
      language,
      preview: {
        ashtakoot_score: ashtakootScore,
        manglik_status:  manglikStatus,
        hook:            previewHook,
      },
      // Echo back partners (client-side names: bride/groom)
      bride: { name: bride.name, place: bride.place, dob: bride.dob, tob: bride.tob },
      groom: { name: groom.name, place: groom.place, dob: groom.dob, tob: groom.tob },
      locked: {
        full_ashtakoot:    true,
        full_manglik:      true,
        remedies:          true,
        gemini_narrative:  true,
        pdf_download:      true,
      },
    });

  } catch (err: unknown) {
    console.error('[Trikal] /api/calc/kundali-milan error:', err);
    return NextResponse.json(
      { error: 'Server error during Milan compute.' },
      { status: 500 }
    );
  }
}
