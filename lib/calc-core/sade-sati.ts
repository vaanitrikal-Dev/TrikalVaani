// ============================================================
// File: lib/calc-core/sade-sati.ts
// Version: v1.0 — 4 Oct 2026 — MCP programme (consolidated deploy)
//
// KYA HAI: /api/calc/sade-sati ka poora dimaag — VM call aur jawab ka aakaar — bina
// Next.js ke. Website ka route aur VM ka MCP dono isi ek file ko chalate hain.
// Logic route v1.7 se akshar-se-akshar uthaya gaya; purane aur naye route
// ka output mila kar jaancha gaya.
// ============================================================

import { buildGranthUpay } from '../bphs84-upay';   // BPHS 84 granth-upay
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

// ─── Determine current Sade Sati phase ──────────────────────────────────────
function getCurrentPhase(currentCycle: any): { phase: string; progress: number; daysRemaining: number; phaseDescription: string } {
  if (!currentCycle?.start || !currentCycle?.end) {
    return { phase: 'Unknown', progress: 0, daysRemaining: 0, phaseDescription: '' };
  }
  const today = new Date();
  const start = new Date(currentCycle.start);
  const end = new Date(currentCycle.end);
  const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const elapsedDays = (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const progress = Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100));
  const daysRemaining = Math.max(0, Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  let phase: string;
  let phaseDescription: string;
  if (progress < 33.33) {
    phase = 'Rising (Aaroh)';
    phaseDescription = 'Saturn is in 12th from your Moon. Beginning of Sade Sati. Watch for losses, expenses, sleep issues, foreign travel possibilities.';
  } else if (progress < 66.66) {
    phase = 'Peak (Madhya)';
    phaseDescription = 'Saturn is in your Moon sign. Most intense phase. Health, mental peace, and relationships need extra care. Spiritual growth opportunity.';
  } else {
    phase = 'Setting (Avaroh)';
    phaseDescription = 'Saturn is in 2nd from your Moon. Final phase. Financial recovery begins, family matters may demand attention, lessons consolidate.';
  }

  return { phase, progress: Math.round(progress), daysRemaining, phaseDescription };
}

// v1.7 — ratna LAGNESH ka (remedy_master r.planet). Pehle pakka likha tha, jabki
// andar ka text kisi aur grah ka ratna batata tha (grahak ko galat ratna dikhta tha).
const STONE: Record<string, { stone: string; metal: string; finger: string }> = {
  Sun:     { stone: 'Ruby (Manik)',              metal: 'Gold',   finger: 'Ring finger' },
  Moon:    { stone: 'Pearl (Moti)',              metal: 'Silver', finger: 'Little finger' },
  Mars:    { stone: 'Red Coral (Moonga)',        metal: 'Gold',   finger: 'Ring finger' },
  Mercury: { stone: 'Emerald (Panna)',           metal: 'Gold',   finger: 'Little finger' },
  Jupiter: { stone: 'Yellow Sapphire (Pukhraj)', metal: 'Gold',   finger: 'Index finger' },
  Venus:   { stone: 'Diamond (Heera)',           metal: 'Gold',   finger: 'Middle finger' },
  Saturn:  { stone: 'Blue Sapphire (Neelam)',    metal: 'Silver', finger: 'Middle finger' },
  Rahu:    { stone: 'Hessonite (Gomed)',         metal: 'Silver', finger: 'Middle finger' },
  Ketu:    { stone: "Cat's Eye (Lehsunia)",      metal: 'Silver', finger: 'Little finger' },
};

// ─── Map VM remedy object to frontend template format ───────────────────────
function buildTemplateFromVMRemedies(vmRemediesObj: any): any {
  const vmRemedies: any[] = vmRemediesObj?.remedies ?? [];
  if (!vmRemedies.length) return null;
  return {
    remedyPlan: {
      remedies: vmRemedies.map((r: any) => {
        const base = { type: r.type, planet: r.planet ?? 'Saturn' };
        // v1.7 (1 Oct 2026) — BPHS 84 ke granth-upay (VM remedy_master v2.0, system "Granth"):
        // koi pakka mantra/daan NAHI chipkaana — seedha granth ka text, hawale ke saath.
        if (r.system === 'Granth') return { ...base, granth: true, srot: r.srot, text: r.detail };
        if (r.type === 'mantra') {
          return { ...base, mantra: 'ॐ शनैश्चराय नमः', count: '108', time: 'शनिवार सूर्योदय से पहले', special: r.detail };
        }
        if (r.type === 'daan') {
          return { ...base, items: 'काला तिल, उड़द दाल, लोहा, सरसों तेल', day: 'शनिवार', recipient: 'गरीब या जरूरतमंद', note: r.detail };
        }
        if (r.type === 'vrat') {
          return { ...base, name: 'शनिवार व्रत', day: 'Saturday', deity: 'Shani Dev', prasad: 'Black sesame, urad dal, mustard oil' };
        }
        if (r.type === 'gemstone') {
          return { ...base, lagna_stone: { ...(STONE[r.planet] ?? STONE.Saturn), for: r.detail } };
        }
        return { ...base, text: r.detail };
      }),
    },
    actionWindows: vmRemediesObj?.actionWindows ?? [],
    avoidWindows: vmRemediesObj?.avoidWindows ?? [],
  };
}

export type SadeSatiOutcome =
  | { ok: false; status: number; error: string; detail?: string }
  | { ok: true; body: Record<string, unknown> };

/** Zaroori field ki jaanch (route jaisi: undefined/null hi galti). */
export function sadesatiBirthError(body: Partial<CalcInput>): string | null {
  const required = ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'];
  for (const f of required) {
    if (body[f as keyof CalcInput] === undefined || body[f as keyof CalcInput] === null) {
      return `Missing field: ${f}`;
    }
  }
  return null;
}

/** Poora jawab — sessionId CHHOD KAR (woh caller jodta hai, doosri key par). */
export async function runSadeSati(body: CalcInput, vm: VmCaller): Promise<SadeSatiOutcome> {
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
    };

    // 1) Call VM /sade-sati — Saturn-specific remedies + actionWindows via remedy_master v1.1
    const ssRes = await vm('/sade-sati', vmPayload);
    if (!ssRes.ok) {
      const errText = await ssRes.text();
      console.error('[sade-sati] VM /sade-sati failed:', errText);
      return { ok: false, status: 502, error: 'Sade Sati engine error', detail: errText };
    }
    const sadeSatiData = await ssRes.json();

    const phaseInfo = sadeSatiData?.currently_in_sade_sati && sadeSatiData?.current_cycle
      ? getCurrentPhase(sadeSatiData.current_cycle)
      : null;

    // Pass full remedies object — includes remedies array + actionWindows
    const templateData = buildTemplateFromVMRemedies(sadeSatiData?.remedies ?? {});

  return { ok: true, body: {
      success: true,
      input: { name: body.name || null, gender: body.gender || null },
      sadeSati: {
        moonRashi: sadeSatiData?.moon_rashi || null,
        currentlyInSadeSati: sadeSatiData?.currently_in_sade_sati || false,
        currentCycle: sadeSatiData?.current_cycle || null,
        allCycles: sadeSatiData?.cycles || [],
        phaseInfo,
      },
      template: templateData,
      granthUpay: buildGranthUpay(null, 'Saturn'),   // v1.7 — components/calculators/GranthUpayBox
    } };
}
