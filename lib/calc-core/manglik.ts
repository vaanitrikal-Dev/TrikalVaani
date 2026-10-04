// ============================================================
// File: lib/calc-core/manglik.ts
// Version: v1.0 — 4 Oct 2026 — MCP programme (consolidated deploy)
//
// KYA HAI: /api/calc/manglik-dosh ka poora dimaag — VM call aur jawab ka aakaar — bina
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

// ─── House meaning per Parashar BPHS ────────────────────────────────────────
function getHouseEffect(house: number): string {
  const effects: Record<number, string> = {
    1: 'Lagna (Self) — Personality, body, temperament. Mars here = aggressive, dominant nature.',
    2: 'Dhana (Wealth) — Family wealth, speech. Mars here = harsh speech, family discord.',
    4: 'Sukha (Home) — Domestic happiness, mother, property. Mars here = home tensions, peace disturbed.',
    7: 'Kalatra (Spouse) — Marriage, partnership. Mars here = marital conflict, spouse health issues.',
    8: 'Ayur (Longevity) — Spouse longevity, in-laws. Mars here = sudden challenges, accident risk to spouse.',
    12: 'Vyaya (Loss) — Bed pleasures, expenses, foreign. Mars here = marital intimacy issues, loss of peace.',
  };
  return effects[house] || `House ${house} — affected by Mars placement.`;
}

function getSeverityColor(severity: string): string {
  if (severity === 'High') return '#FCA5A5';
  if (severity === 'Medium') return '#FBBF24';
  if (severity === 'Low') return '#86EFAC';
  return '#94a3b8';
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
        const base = { type: r.type, planet: r.planet ?? 'Mars' };
        // v1.7 (1 Oct 2026) — BPHS 84 ke granth-upay (VM remedy_master v2.0, system "Granth"):
        // koi pakka mantra/daan NAHI chipkaana — seedha granth ka text, hawale ke saath.
        if (r.system === 'Granth') return { ...base, granth: true, srot: r.srot, text: r.detail };
        if (r.type === 'mantra') {
          return { ...base, mantra: 'ॐ अंगारकाय नमः', count: '108', time: 'मंगलवार सुबह', special: r.detail };
        }
        if (r.type === 'daan') {
          return { ...base, items: 'मसूर दाल, गुड़, तांबा, लाल वस्त्र', day: 'मंगलवार', recipient: 'गरीब या जरूरतमंद', note: r.detail };
        }
        if (r.type === 'vrat') {
          return { ...base, name: 'मंगलवार व्रत', day: 'Tuesday', deity: 'Hanuman ji', prasad: 'Red lentils, jaggery, red flowers' };
        }
        if (r.type === 'gemstone') {
          return { ...base, lagna_stone: { ...(STONE[r.planet] ?? STONE.Mars), for: r.detail } };
        }
        return { ...base, text: r.detail };
      }),
    },
    actionWindows: vmRemediesObj?.actionWindows ?? [],
    avoidWindows: vmRemediesObj?.avoidWindows ?? [],
  };
}

export type ManglikOutcome =
  | { ok: false; status: number; error: string; detail?: string }
  | { ok: true; body: Record<string, unknown> };

/** Zaroori field ki jaanch (route jaisi: undefined/null hi galti). */
export function manglikBirthError(body: Partial<CalcInput>): string | null {
  const required = ['year', 'month', 'day', 'hour', 'minute', 'latitude', 'longitude', 'timezone'];
  for (const f of required) {
    if (body[f as keyof CalcInput] === undefined || body[f as keyof CalcInput] === null) {
      return `Missing field: ${f}`;
    }
  }
  return null;
}

/** Poora jawab — sessionId CHHOD KAR (woh caller jodta hai, doosri key par). */
export async function runManglik(body: CalcInput, vm: VmCaller): Promise<ManglikOutcome> {
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

    // 1) Call VM /manglik-dosh — Mars-specific remedies + actionWindows via remedy_master v1.1
    const mdRes = await vm('/manglik-dosh', vmPayload);
    if (!mdRes.ok) {
      const errText = await mdRes.text();
      console.error('[manglik-dosh] VM /manglik-dosh failed:', errText);
      return { ok: false, status: 502, error: 'Manglik engine error', detail: errText };
    }
    const manglikData = await mdRes.json();

    const houseEffect = manglikData?.is_manglik && manglikData?.mars_house
      ? getHouseEffect(manglikData.mars_house)
      : null;

    // Pass full remedies object — includes remedies array + actionWindows
    const templateData = buildTemplateFromVMRemedies(manglikData?.remedies ?? {});

  return { ok: true, body: {
      success: true,
      input: { name: body.name || null, gender: body.gender || null },
      manglik: {
        isManglik: manglikData?.is_manglik || false,
        severity: manglikData?.severity || null,
        severityColor: getSeverityColor(manglikData?.severity || ''),
        marsHouse: manglikData?.mars_house || null,
        marsSign: manglikData?.mars_sign || null,
        marsLongitude: manglikData?.mars_longitude || null,
        houseEffect,
        cancellationConditions: manglikData?.cancellation_conditions || [],
        manglikHousesAffected: manglikData?.manglik_houses_affected || [1, 2, 4, 7, 8, 12],
      },
      template: templateData,
      granthUpay: buildGranthUpay(null, 'Mars'),   // v1.7 — components/calculators/GranthUpayBox
    } };
}
