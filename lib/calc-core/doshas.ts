// ============================================================
// File: lib/calc-core/doshas.ts
// Version: v1.0 — 4 Oct 2026 — MCP programme (consolidated deploy)
//
// KYA HAI: /api/calc/doshas ka poora dimaag — VM call aur jawab ka aakaar — bina
// Next.js ke. Website ka route aur VM ka MCP dono isi ek file ko chalate hain.
// Logic route v1.3 se akshar-se-akshar uthaya gaya; purane aur naye route
// ka output mila kar jaancha gaya.
// ============================================================

import type { VmCaller } from './yog';

export type { VmCaller };

export interface CalcInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
  timezone: number;
  name?: string;
  gender?: 'male' | 'female' | 'other';
}



export type DoshaOutcome =
  | { ok: false; status: number; error: string; detail?: string }
  | { ok: true; body: Record<string, unknown> };

/** Zaroori field ki jaanch (route jaisi: undefined/null hi galti). */
export function doshasBirthError(body: Partial<CalcInput>): string | null {
  const required = ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'];
  for (const f of required) {
    if (body[f as keyof CalcInput] === undefined || body[f as keyof CalcInput] === null) {
      return `Missing field: ${f}`;
    }
  }
  return null;
}

/** Poora jawab — sessionId CHHOD KAR (woh caller jodta hai, doosri key par). */
export async function runDoshas(body: CalcInput, vm: VmCaller): Promise<DoshaOutcome> {
    const vmPayload = {
      year: body.year,
      month: body.month,
      day: body.day,
      hour: body.hour,
      minute: body.minute,
      second: 0,
      latitude: body.latitude,
      longitude: body.longitude,
      timezone: body.timezone,
      ayanamsa: 'lahiri',
      house_system: 'P',
    };

    const res = await vm('/doshas', vmPayload);
    if (!res.ok) {
      const errText = await res.text();
      console.error('[doshas] VM /doshas failed:', errText);
      return { ok: false, status: 502, error: 'Dosha engine error', detail: errText };
    }
    const data = await res.json();

    // v1.1: check_all_doshas returns a dict { doshas:[...], present_count, summary, lang }.
    // Be robust: accept either the dict or a bare list.
    const raw = data?.doshas;
    const doshaList = Array.isArray(raw)
      ? raw
      : (Array.isArray(raw?.doshas) ? raw.doshas : []);
    const summary = (raw && !Array.isArray(raw)) ? (raw.summary ?? null) : null;
    const presentCount = (raw && !Array.isArray(raw)) ? (raw.present_count ?? null) : null;

  return { ok: true, body: {
      success: true,
      input: { name: body.name || null, gender: body.gender || null },
      doshas: doshaList,
      summary,
      present_count: presentCount,
      rahu_house: data?.rahu_house ?? null,
      ketu_house: data?.ketu_house ?? null,
      lagna: data?.lagna ?? null,
    } };
}
