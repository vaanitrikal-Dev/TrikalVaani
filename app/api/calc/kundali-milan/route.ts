/**
 * ============================================================
 * TRIKAL VAANI — Kundali Milan Compute API
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: app/api/calc/kundali-milan/route.ts
 * VERSION: 1.2 — BUGFIX (field-name mismatch with form)
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 * CHANGES v1.2 (BUGFIX ONLY):
 *   ✅ FIXED: Zod schema now accepts the field names the form
 *      actually sends (KundaliMilanForm.tsx buildMilanBody):
 *        latitude  ← lat
 *        longitude ← lng
 *        place     ← cityName
 *      Previously free preview was REJECTED (400) because the
 *      schema demanded latitude/longitude/place but the form
 *      sent lat/lng/cityName. Free submit silently failed.
 *   ✅ Backward compatible: still accepts latitude/longitude/place
 *      if ever sent that way (both names allowed).
 *   ✅ Accepts extra fields the form sends (sessionId, ayanamsa,
 *      contact, paymentVerification) without rejecting.
 *   ✅ NOTHING ELSE CHANGED. VM payload person1/person2 intact.
 *      Public response shape intact. Free-tier behavior intact.
 *
 * CHANGES v1.1 (prior):
 *   ✅ VM /milan-compute payload bride→person1, groom→person2
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

// ── Helpers: coerce form field names → canonical ─────────────
// The form (buildMilanBody) sends: lat, lng, cityName, timezone.
// Older/alternate callers may send: latitude, longitude, place.
// We accept BOTH and normalise to latitude/longitude/place.
const partnerSchema = z
  .object({
    name:      z.string().trim().min(1, 'Name required').max(80),
    gender:    z.enum(['male', 'female']).optional(),
    dob:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be YYYY-MM-DD'),
    tob:       z.string().regex(/^\d{2}:\d{2}$/, 'TOB must be HH:MM'),

    // Place: accept either `place` or `cityName`
    place:     z.string().trim().max(160).optional(),
    cityName:  z.string().trim().max(160).optional(),

    // Latitude: accept either `latitude` or `lat`
    latitude:  z.number().min(-90).max(90).optional(),
    lat:       z.number().min(-90).max(90).optional(),

    // Longitude: accept either `longitude` or `lng`
    longitude: z.number().min(-180).max(180).optional(),
    lng:       z.number().min(-180).max(180).optional(),

    timezone:  z.number().min(-12).max(14),

    // Tolerate extra fields the form sends without failing
    ayanamsa:  z.string().optional(),
  })
  .passthrough()
  .transform((p) => {
    const latitude  = p.latitude  ?? p.lat;
    const longitude = p.longitude ?? p.lng;
    const place     = p.place     ?? p.cityName ?? '';
    return { ...p, latitude, longitude, place };
  })
  .refine((p) => typeof p.latitude === 'number',  { message: 'latitude/lat required' })
  .refine((p) => typeof p.longitude === 'number', { message: 'longitude/lng required' })
  .refine((p) => p.place.length >= 1,             { message: 'place/cityName required' });

// ── Full request (client API stays bride/groom) ─────────────
// .passthrough() lets through sessionId, contact, paymentVerification,
// audienceVersion, etc. without rejecting the request.
const requestSchema = z
  .object({
    bride:    partnerSchema,
    groom:    partnerSchema,
    audience: z.enum(['couple', 'parent', 'both']).optional(),
    // Form sends audienceVersion; accept that too
    audienceVersion: z.enum(['couple', 'parent', 'both']).optional(),
    language: z.enum(['hinglish', 'hindi', 'english']).default('hinglish'),
    tier:     z.string().optional(),
  })
  .passthrough();

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

    const data = parsed.data;
    const bride = data.bride;
    const groom = data.groom;
    const audience = (data.audience ?? data.audienceVersion ?? 'couple') as
      'couple' | 'parent' | 'both';
    const language = data.language;

    // ── VM expects person1/person2 (v1.1) ──────────────────
    const vmPayload = {
      person1: {
        name:      bride.name,
        gender:    bride.gender ?? 'female',
        year:      Number(bride.dob.slice(0, 4)),
        month:     Number(bride.dob.slice(5, 7)),
        day:       Number(bride.dob.slice(8, 10)),
        hour:      Number(bride.tob.slice(0, 2)),
        minute:    Number(bride.tob.slice(3, 5)),
        latitude:  bride.latitude as number,
        longitude: bride.longitude as number,
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
        latitude:  groom.latitude as number,
        longitude: groom.longitude as number,
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
    // Free tier: ashtakoot score + manglik flag + 1 hook line.
    // Paid tiers receive full data via /verify-milan-payment.
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
