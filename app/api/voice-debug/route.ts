/**
 * ============================================================
 * TRIKAL VAANI — Diagnostic endpoint for Google credentials
 * File: app/api/voice-debug/route.ts
 * VERSION: 1.0 — Temporary diagnostic
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * PURPOSE:
 *   Visit /api/voice-debug in browser to see exactly why
 *   Google STT auth is failing. Safe — does NOT expose actual key.
 *
 * REMOVE AFTER FIX.
 * ============================================================
 */

import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function GET() {
  const result: Record<string, unknown> = {
    version: 'voice-debug-v1.0',
    timestamp: new Date().toISOString(),
  };

  // ── Check env vars exist ──────────────────────────────────
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_CLOUD_PRIVATE_KEY;

  result.has_project_id = !!projectId;
  result.has_client_email = !!clientEmail;
  result.has_private_key = !!privateKeyRaw;
  result.project_id_value = projectId; // safe to show
  result.client_email_value = clientEmail; // safe to show
  result.private_key_length = privateKeyRaw?.length || 0;

  if (!privateKeyRaw) {
    result.error = 'GOOGLE_CLOUD_PRIVATE_KEY is missing';
    return NextResponse.json(result);
  }

  // ── Inspect private key format (NO actual key shown) ──────
  result.private_key_starts_with = privateKeyRaw.substring(0, 30);
  result.private_key_ends_with = privateKeyRaw.substring(privateKeyRaw.length - 30);
  result.has_literal_backslash_n = privateKeyRaw.includes('\\n');
  result.has_real_newlines = privateKeyRaw.includes('\n');
  result.has_begin_marker = privateKeyRaw.includes('BEGIN PRIVATE KEY');
  result.has_end_marker = privateKeyRaw.includes('END PRIVATE KEY');

  // ── Try to normalize key ──────────────────────────────────
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
  result.after_replace_has_newlines = privateKey.includes('\n');
  result.after_replace_line_count = privateKey.split('\n').length;

  // ── Test JWT signing ──────────────────────────────────────
  try {
    const signer = crypto.createSign('RSA-SHA256');
    signer.update('test.payload');
    const sig = signer.sign(privateKey);
    result.signing_test = 'PASS';
    result.signature_length = sig.length;
  } catch (e) {
    result.signing_test = 'FAIL';
    result.signing_error = e instanceof Error ? e.message : String(e);
    return NextResponse.json(result);
  }

  // ── Test full token exchange ──────────────────────────────
  try {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const claim = {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    const toBase64Url = (input: Buffer | string) => {
      const buf = typeof input === 'string' ? Buffer.from(input) : input;
      return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };

    const headerB64 = toBase64Url(JSON.stringify(header));
    const claimB64 = toBase64Url(JSON.stringify(claim));
    const unsigned = `${headerB64}.${claimB64}`;

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(unsigned);
    const signature = signer.sign(privateKey);
    const jwt = `${unsigned}.${toBase64Url(signature)}`;

    result.jwt_built = true;
    result.jwt_length = jwt.length;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    const tokenData = await tokenRes.json();
    result.token_status = tokenRes.status;
    result.token_response = tokenData;
    result.token_obtained = !!tokenData.access_token;
  } catch (e) {
    result.token_error = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(result, { status: 200 });
}
