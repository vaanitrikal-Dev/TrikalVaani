'use client';

// ============================================================
// File: components/calculators/YogCalculator.tsx
// Version: v2.3 — santan pre-pay block fixed (2 Sep 2026)
//
// CHANGELOG v2.3 — caught on the live page, not in review. The pre-pay block
// below is written around the generic shape: it counts locked RULES, counts
// BLOCKERS, and lists directionNames. santanFreeShape sends none of those, so
// on santan it rendered "Baaki 0 rules" and "0 blockers ka poora vishleshan" —
// telling a paying visitor there is nothing behind the paywall. The bullet list
// is now santan-aware; the payment buttons underneath are shared and untouched.
// Version: v2.2 — Santan Yog v2.0 result view (2 Sep 2026)
//
// CHANGELOG v2.2 (2026-09-02):
//   Santan gets its OWN result view. Everything else is untouched — the three
//   live calculators do not enter a single new branch, because the switch is
//   one ternary at the top of the result block keyed on config.type.
//
//   WHY A SEPARATE VIEW RATHER THAN MORE CONFIG. The generic view sells locked
//   RULE ROWS: marks visible, reasoning withheld. That is right for an exam
//   score, where the rows are the product. It is wrong for a person asking
//   whether they will have children — to them "5th lord ki taakat 7.4/12" is
//   noise, and Radar agrees: of ~150 keywords in the santan cluster, not one
//   mentions Shadbala, virupas, Saptamsa or Putrakaraka, while ~18 ask KAB,
//   ~7 ask KITNE and ~6 ask UPAY. So santan leads with the verdict and a
//   plain-language summary, and locks exactly those three things by name.
//
//   The technical breakdown is NOT thrown away — it still renders, below the
//   summary, for the paid reader who wants to see the working.
// Version: v2.1 — Santan Yog supported (2 Sep 2026)
// Purpose: One form + one result renderer, shared by all four yog
//          calculators (IAS/UPSC, Videsh Settlement, Foreign Spouse, Santan).
//
// CHANGELOG v2.1 (2026-09-02):
//   Four additions, every one of them defaulted so the three live pages
//   render byte-identically to v2.0.
//   1. `type` accepts 'santan'.
//   2. `hintsHeading` — the hints section had "Jeevansaathi kahan se" HARD
//      CODED. That is foreign-spouse wording. Santan puts upay directions in
//      the same slot, and a progeny result headed "Jeevansaathi kahan se"
//      would read as a bug. Defaults to the old string.
//   3. `hintsTeaser` — same problem in the locked list ("Disha aur sanskriti
//      ke sanket"). Defaults to the old string.
//   4. `showNextStep` — Santan is a NEW product with no other product to
//      point at, so its paid view must not end in a CTA. Defaults true, so
//      the other three keep theirs. The green "payment ho gaya" confirmation
//      is deliberately kept even when the CTA is off: removing it is what
//      caused the earlier "did my payment fail?" confusion.
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ------------------------------------------------------------
// WHY SHARED
//   The three pages differ in copy, not in behaviour. Duplicating ~700 lines
//   three times would mean fixing every bug three times. Each page.tsx now
//   carries only its own words, SEO and JSON-LD, and hands the rest here.
//
// THE POINT OF THIS COMPONENT
//   Rendering the score is the easy half. The half that matters is rendering
//   the REASON beside every rule, with the real figure. Other tools stop at
//   the number. The result panel below is built so a reason can never be
//   dropped — it iterates the rules the engine returns, and the engine
//   cannot produce a rule without one.
//
//   The city input, place lookup and timezone fetch follow the exact pattern
//   already used by the other free calculators, so behaviour stays familiar.
// ============================================================

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay-helper';
import PayPalCheckout, { type PayPalProof } from '@/components/payment/PayPalCheckout';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// ── Types mirroring the /api/calc/yog response ───────────────────────────────

interface ScoredRule {
  block: string;
  label: string;
  points: number;
  max: number;
  reason: string;
  absent: boolean;
}

interface YogPayload {
  score: number;
  band: string;
  bandHi: string;
  rules: ScoredRule[];
  highlights: ScoredRule[];
  blockers: ScoredRule[];
  disclaimer: string;
  direction?: { track: string; score: number; reason: string }[];
  routes?: { route: string; score: number; reason: string }[];
  directionHints?: { hint: string; reason: string }[];
  timing?: { period: string; why: string }[];
  nextStep?: { title: string; body: string; href: string; price: string };
}

/** Free tier: marks visible, reasoning withheld. See app/api/calc/yog/route.ts. */
interface LockedRule {
  block: string; label: string; points: number; max: number; absent: boolean;
}

interface FreePayload {
  score: number; band: string; bandHi: string; disclaimer: string;
  highlights: ScoredRule[];
  rules: LockedRule[];
  lockedCount: number;
  blockers: { label: string; teaser: string }[];
  directionNames: string[];
  directionHintCount: number;
  timingCount: number;
  nextStep?: YogPayload['nextStep'];
}

interface ApiResponse {
  success: boolean;
  type: string;
  paid: boolean;
  chart: {
    lagna: string | null;
    lagna_en: string | null;
    lagna_lord: string | null;
    mahadasha: string | null;
    antardasha: string | null;
    dasamsaLagna: string | null;
    navamsaLagna: string | null;
  };
  result: YogPayload | FreePayload;
}

export interface YogCalculatorConfig {
  /** Matches the `type` the API expects. */
  type: 'upsc' | 'foreign-settlement' | 'foreign-spouse' | 'santan';
  scoreLabel: string;
  /** Heading above the per-rule breakdown. */
  breakdownHeading: string;
  /** Heading for the direction / routes list, when the engine returns one. */
  secondaryHeading?: string;
  /** Heading above the engine's hints. Default is the foreign-spouse wording. */
  hintsHeading?: string;
  /** One-line teaser for the hints in the locked list. */
  hintsTeaser?: string;
  /**
   * Show the post-payment CTA to another product. Set false for a product
   * that has nothing to cross-sell — the paid view then ends on the report.
   */
  showNextStep?: boolean;
  ctaHref: string;
  ctaLabel: string;
  ctaPrice: string;
  ctaBlurb: string;
}

interface PlaceSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

interface FormData {
  name: string;
  gender: 'male' | 'female' | 'other' | '';
  date: string;
  time: string;
  unknownTime: boolean;
  placeQuery: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  timezone: number;
}

// ── Google Maps via /api/maps-proxy (same as the other calculators) ──────────

async function fetchPlaceSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (query.length < 3) return [];
  try {
    const res = await fetch(
      `/api/maps-proxy?url=${encodeURIComponent('https://places.googleapis.com/v1/places:autocomplete')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: query,
          includedPrimaryTypes: ['locality', 'administrative_area_level_3'],
          languageCode: 'en',
        }),
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.suggestions ?? []).map((s: any) => ({
      place_id: s.placePrediction?.placeId ?? '',
      description: s.placePrediction?.text?.text ?? '',
      main_text: s.placePrediction?.structuredFormat?.mainText?.text ?? '',
      secondary_text: s.placePrediction?.structuredFormat?.secondaryText?.text ?? '',
    }));
  } catch { return []; }
}

async function fetchPlaceDetails(placeId: string) {
  if (!placeId) return null;
  try {
    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=location,displayName`;
    const res = await fetch(`/api/maps-proxy?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const lat = data.location?.latitude ?? null;
    const lng = data.location?.longitude ?? null;
    if (lat === null || lng === null) return null;
    return { lat, lng, city: data.displayName?.text ?? '' };
  } catch { return null; }
}

async function fetchTimezone(lat: number, lng: number): Promise<number> {
  try {
    const ts = Math.floor(Date.now() / 1000);
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${ts}`;
    const res = await fetch(`/api/maps-proxy?url=${encodeURIComponent(url)}`);
    if (!res.ok) return 5.5;
    const data = await res.json();
    if (data.status !== 'OK') return 5.5;
    return Math.round(((data.rawOffset + data.dstOffset) / 3600) * 4) / 4;
  } catch { return 5.5; }
}

function CityInput({ id, value, onSelect, error }: {
  id: string; value: string;
  onSelect: (city: string, lat: number, lng: number, timezone: number) => void;
  error?: string;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setQuery(value); }, [value]);

  const handleChange = (val: string) => {
    setQuery(val); setSelected(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setSuggestions(await fetchPlaceSuggestions(val));
      setLoading(false);
    }, 400);
  };

  const handleSelect = async (s: PlaceSuggestion) => {
    setQuery(s.main_text); setSuggestions([]); setSelected(true); setLoading(true);
    const details = await fetchPlaceDetails(s.place_id);
    if (details) {
      const tz = await fetchTimezone(details.lat, details.lng);
      onSelect(details.city || s.main_text, details.lat, details.lng, tz);
    }
    setLoading(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input id={id} type="search" autoComplete="off" placeholder="Type city of birth..."
          value={query} onChange={e => handleChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg text-sm outline-none pr-10"
          style={{ background: '#0d1120', border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0', colorScheme: 'dark' }} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
          {loading ? <span style={{ color: GOLD }}>⟳</span> : selected ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#475569' }}>📍</span>}
        </span>
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden shadow-xl"
          style={{ background: '#0d1120', border: '1px solid rgba(212,175,55,0.2)', maxHeight: '200px', overflowY: 'auto' }}>
          {suggestions.map((s, i) => (
            <li key={i} onClick={() => handleSelect(s)} className="px-4 py-3 text-sm cursor-pointer"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={e => (e.currentTarget.style.background = GOLD_RGBA(0.08))}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <p style={{ margin: 0, color: '#e2e8f0', fontWeight: 600 }}>{s.main_text}</p>
              <p style={{ margin: 0, color: '#64748b', fontSize: '11px' }}>{s.secondary_text}</p>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ── Small presentational bits ────────────────────────────────────────────────

function bandColor(band: string) {
  if (band === 'Very Strong') return '#86EFAC';
  if (band === 'Strong') return '#86EFAC';
  if (band === 'Moderate') return GOLD;
  return '#FCA5A5';
}

/** Renders **bold** segments the engines use for emphasis, nothing else. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? <strong key={i} style={{ color: '#E5E7EB' }}>{p}</strong> : <span key={i}>{p}</span>,
      )}
    </>
  );
}

function RuleRow({ r }: { r: ScoredRule }) {
  const pct = r.max ? Math.round((r.points / r.max) * 100) : 0;
  const col = pct >= 70 ? '#86EFAC' : pct >= 35 ? GOLD : '#FCA5A5';
  return (
    <div className="py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <p className="text-sm font-semibold m-0" style={{ color: '#e2e8f0' }}>{r.label}</p>
        <span className="text-xs font-mono shrink-0" style={{ color: col }}>
          {r.points.toFixed(1)} / {r.max}
        </span>
      </div>
      <div className="h-1 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: col }} />
      </div>
      <p className="text-xs leading-relaxed m-0" style={{ color: '#94a3b8' }}>
        <Rich text={r.reason} />
      </p>
    </div>
  );
}

/** A rule the free tier can see the marks for but not the reasoning. */
function LockedRow({ r }: { r: LockedRule }) {
  const pct = r.max ? Math.round((r.points / r.max) * 100) : 0;
  return (
    <div className="py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <p className="text-sm font-semibold m-0" style={{ color: '#94a3b8' }}>{r.label}</p>
        <span className="text-xs font-mono shrink-0" style={{ color: '#64748b' }}>
          {r.points.toFixed(1)} / {r.max}
        </span>
      </div>
      <div className="h-1 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: '#475569' }} />
      </div>
      <p className="text-xs m-0" style={{ color: '#64748b' }}>
        &#128274; Wajah report mein
      </p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

// ── v2.2 — SANTAN VIEW ───────────────────────────────────────────────────────
//
// Everything a person asking about children actually came for, in the order
// they asked for it: the answer, then why, then when, then how many, then what
// to do. No score, no ratios, no varga names on the free tier.

function fmtDate(iso: string): string {
  if (!iso || iso.length < 7) return iso;
  const [y, m] = iso.split('-');
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mi = Number(m) - 1;
  return `${MON[mi] ?? m} ${y}`;
}

function verdictColour(key: string): string {
  if (key === 'haan') return '#4ADE80';
  if (key === 'sambhavna') return GOLD;
  return '#FCA5A5';
}

function SantanView({ r, paid }: { r: any; paid: boolean }) {
  const v = r.verdict;
  return (
    <>
      {/* THE ANSWER */}
      {v && (
        <section className="rounded-2xl p-6 mb-5 text-center"
          style={{ background: '#0B0F1A', border: `1px solid ${GOLD_RGBA(0.28)}` }}>
          <p className="text-xs uppercase tracking-widest m-0 mb-2" style={{ color: '#64748b' }}>
            Aapke chart ka jawab
          </p>
          <p className="m-0 text-2xl md:text-3xl font-bold leading-tight" style={{ color: verdictColour(v.key) }}>
            {v.labelHi}
          </p>
          <p className="m-0 mt-1 text-sm" style={{ color: '#94a3b8' }}>{v.label}</p>
        </section>
      )}

      {/* THE SUMMARY — 75 words free, 500 paid */}
      {r.summary && (
        <section className="rounded-2xl p-5 md:p-6 mb-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {String(r.summary).split('\n').filter(Boolean).map((para: string, i: number) => (
            <p key={i} className="text-sm md:text-base leading-relaxed m-0 mb-3 last:mb-0" style={{ color: '#cbd5e1' }}>
              {para}
            </p>
          ))}
        </section>
      )}

      {/* FREE — three locks, named honestly */}
      {!paid && Array.isArray(r.locks) && (
        <section className="rounded-2xl p-5 md:p-6 mb-5"
          style={{ background: '#0B0F1A', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
          <h2 className="text-base font-bold m-0 mb-1" style={{ color: GOLD }}>Poori reading mein aur kya hai</h2>
          <p className="text-xs m-0 mb-4" style={{ color: '#64748b' }}>
            Ye teen cheezein aapke chart se nikal chuki hain — report mein khul jaati hain.
          </p>
          {r.locks.map((l: any) => (
            <div key={l.key} className="flex items-start gap-3 py-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-lg leading-none mt-0.5">🔒</span>
              <div>
                <p className="m-0 text-sm font-semibold" style={{ color: '#e2e8f0' }}>{l.title}</p>
                <p className="m-0 text-xs mt-1 leading-relaxed" style={{ color: '#94a3b8' }}>{l.teaser}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* PAID — KAB, as a table of real dates */}
      {paid && Array.isArray(r.windows) && r.windows.length > 0 && (
        <section className="rounded-2xl p-5 md:p-6 mb-5"
          style={{ background: '#0B0F1A', border: `1px solid ${GOLD_RGBA(0.22)}` }}>
          <h2 className="text-base font-bold m-0 mb-1" style={{ color: GOLD }}>Kab — anukool samay</h2>
          <p className="text-xs m-0 mb-4" style={{ color: '#64748b' }}>
            Ye khidkiyan aapki apni Vimshottari dasha se nikli hain.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: GOLD_RGBA(0.08) }}>
                  <th scope="col" className="p-2 text-left" style={{ color: GOLD }}>Daur</th>
                  <th scope="col" className="p-2 text-left" style={{ color: GOLD }}>Se</th>
                  <th scope="col" className="p-2 text-left" style={{ color: GOLD }}>Tak</th>
                </tr>
              </thead>
              <tbody style={{ color: '#cbd5e1' }}>
                {r.windows.map((w: any, i: number) => (
                  <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <td className="p-2 font-semibold">{w.label}</td>
                    <td className="p-2 whitespace-nowrap">{fmtDate(w.from)}</td>
                    <td className="p-2 whitespace-nowrap">{fmtDate(w.to)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            {r.windows.map((w: any, i: number) => (
              <p key={i} className="text-xs m-0 mb-2 leading-relaxed" style={{ color: '#94a3b8' }}>
                <b style={{ color: '#cbd5e1' }}>{w.label}:</b> {w.why}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* PAID — KITNE, always a range */}
      {paid && r.sankhya && (
        <section className="rounded-2xl p-5 md:p-6 mb-5"
          style={{ background: '#0B0F1A', border: `1px solid ${GOLD_RGBA(0.22)}` }}>
          <h2 className="text-base font-bold m-0 mb-3" style={{ color: GOLD }}>Kitne — shastriya sanket</h2>
          <p className="m-0 text-3xl font-bold" style={{ color: GOLD }}>
            {r.sankhya.min}–{r.sankhya.max}
            <span className="text-sm font-normal" style={{ color: '#64748b' }}> santan ka sanket</span>
          </p>
          <p className="text-xs mt-3 mb-0 leading-relaxed" style={{ color: '#94a3b8' }}>{r.sankhya.basis}</p>
          <p className="text-xs mt-2 mb-0 leading-relaxed" style={{ color: '#64748b' }}>
            Ye anuman hai, ginti nahi. Shastra range deta hai; aaj ke samay mein sankhya chikitsa, aarthik
            nirnay aur vyaktigat chunav par bhi nirbhar karti hai.
          </p>
        </section>
      )}

      {/* PAID — TRIKAAL UPAY */}
      {paid && Array.isArray(r.upay) && r.upay.length > 0 && (
        <section className="rounded-2xl p-5 md:p-6 mb-5"
          style={{ background: '#0B0F1A', border: `1px solid ${GOLD_RGBA(0.28)}` }}>
          <h2 className="text-base font-bold m-0 mb-1" style={{ color: GOLD }}>Trikaal Upay</h2>
          <p className="text-xs m-0 mb-4" style={{ color: '#64748b' }}>
            Paanch upay, aapke apne chart se chune gaye — do BPHS se, do Bhrigu paddhati se, ek aapke sabse
            kamzor santan graha ki ganit se.
          </p>
          {r.upay.map((u: any) => (
            <div key={u.n} className="py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ background: GOLD_RGBA(0.15), color: GOLD }}>{u.source}</span>
                <p className="m-0 text-sm font-semibold" style={{ color: '#e2e8f0' }}>{u.n}. {u.title}</p>
              </div>
              <p className="m-0 mt-2 text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>{u.what}</p>
              <p className="m-0 mt-1 text-xs" style={{ color: '#94a3b8' }}><b>Kab:</b> {u.when}</p>
              <p className="m-0 mt-1 text-xs leading-relaxed" style={{ color: '#64748b' }}>{u.why}</p>
            </div>
          ))}
        </section>
      )}
    </>
  );
}

export default function YogCalculator({ config }: { config: YogCalculatorConfig }) {
  const [form, setForm] = useState<FormData>({
    name: '', gender: '', date: '', time: '', unknownTime: false,
    placeQuery: '', city: '', latitude: null, longitude: null, timezone: 5.5,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [paying, setPaying] = useState(false);
  const [isIndia, setIsIndia] = useState<boolean | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  // Which checkout to offer. India pays Rs 51 by Razorpay; everyone else pays
  // $7 by PayPal, because Razorpay does not carry international cards on this
  // account. The header falls back to India, which is today's behaviour.
  useEffect(() => {
    let cancelled = false;

    // `?intl=1` forces the PayPal view. Needed because the team sits in Delhi
    // and would otherwise never see the international checkout at all.
    // Deliberately ONE-WAY: it can only switch a rupee payer TO dollars, never
    // the reverse. The worst a stranger can do with it is pay more, and the
    // server still prices and verifies everything itself, so this cannot be
    // used to pay less or to unlock anything without a real payment.
    const forced =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('intl') === '1';
    if (forced) { setIsIndia(false); return; }

    fetch('/api/geo')
      .then((r) => r.json())
      .then((g) => { if (!cancelled) setIsIndia(g?.isIndia !== false); })
      .catch(() => { if (!cancelled) setIsIndia(true); });
    return () => { cancelled = true; };
  }, []);

  /** Birth details in the shape the API wants. Reused for the paid re-request. */
  const birthPayload = () => {
    const [year, month, day] = form.date.split('-').map(Number);
    const [hour, minute] = (form.unknownTime ? '12:00' : form.time).split(':').map(Number);
    return {
      type: config.type,
      year, month, day, hour, minute,
      latitude: form.latitude, longitude: form.longitude, timezone: form.timezone,
      name: form.name || null, gender: form.gender || null,
    };
  };

  /** Re-request the same reading WITH proof of payment. The server re-verifies. */
  const fetchPaid = async (proof: Record<string, string>) => {
    const res = await fetch('/api/calc/yog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...birthPayload(), ...proof }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      setApiError(json.error || 'Payment ho gaya par report khul nahi payi. Support se baat karein — dobara payment na karein.');
      return;
    }
    setData(json);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const payWithRazorpay = async () => {
    setApiError(null);
    setPaying(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) { setApiError('Payment window load nahi hui. Refresh karke dobara try karein.'); setPaying(false); return; }

      const oRes = await fetch('/api/calc/yog/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: config.type }),
      });
      const order = await oRes.json();
      if (!oRes.ok || !order.orderId) {
        setApiError(order.error || 'Order nahi ban paya. Dobara try karein.');
        setPaying(false);
        return;
      }

      openRazorpayCheckout({
        keyId: order.keyId,
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'Trikaal Vaani',
        description: order.description,
        prefillName: form.name || undefined,
        onSuccess: async (r) => {
          await fetchPaid({
            razorpay_order_id: r.razorpay_order_id,
            razorpay_payment_id: r.razorpay_payment_id,
            razorpay_signature: r.razorpay_signature,
          });
          setPaying(false);
        },
        onDismiss: () => setPaying(false),
      });
    } catch {
      setApiError('Payment flow mein dikkat aayi. Dobara try karein.');
      setPaying(false);
    }
  };

  const onPayPalPaid = async (proof: PayPalProof) => {
    setPaying(true);
    await fetchPaid({ paypal_order_id: proof.paypal_order_id });
    setPaying(false);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.date) e.date = 'Date of birth zaroori hai';
    if (!form.unknownTime && !form.time) e.time = 'Time of birth zaroori hai (ya "pata nahi" chunein)';
    if (form.latitude === null || form.longitude === null) e.city = 'List mein se apna janm sthan chunein';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setApiError(null);
    setLoading(true);
    setData(null);
    try {
      const res = await fetch('/api/calc/yog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(birthPayload()),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setApiError(json.error || 'Kuch galat ho gaya. Dobara koshish karein.');
      } else {
        setData(json);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      }
    } catch {
      setApiError('Network error. Dobara koshish karein.');
    } finally {
      setLoading(false);
    }
  };

  const paid = data?.paid === true;
  const r: any = data?.result;
  const secondary = paid ? (r?.direction ?? r?.routes ?? null) : null;

  return (
    <>
      {/* ── FORM ───────────────────────────────────────────────── */}
      <section className="rounded-2xl p-5 md:p-6 mb-8"
        style={{ background: '#0B0F1A', border: `1px solid ${GOLD_RGBA(0.18)}` }}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="yog-name" className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Naam (optional)</label>
            <input id="yog-name" type="text" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
          </div>
          <div>
            <label htmlFor="yog-gender" className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Gender (optional)</label>
            <select id="yog-gender" value={form.gender}
              onChange={e => setForm(p => ({ ...p, gender: e.target.value as FormData['gender'] }))}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', colorScheme: 'dark' }}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="yog-date" className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Date of Birth *</label>
            <input id="yog-date" type="date" value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: '#0d1120', border: `1px solid ${errors.date ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0', colorScheme: 'dark' }} />
            {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
          </div>
          <div>
            <label htmlFor="yog-time" className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Time of Birth *</label>
            <input id="yog-time" type="time" value={form.time} disabled={form.unknownTime}
              onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none disabled:opacity-40"
              style={{ background: '#0d1120', border: `1px solid ${errors.time ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0', colorScheme: 'dark' }} />
            <label className="flex items-center gap-2 mt-1.5 text-xs cursor-pointer" style={{ color: '#64748b' }}>
              <input type="checkbox" checked={form.unknownTime}
                onChange={e => setForm(p => ({ ...p, unknownTime: e.target.checked }))} />
              Time pata nahi (12:00 PM maan lenge)
            </label>
            {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time}</p>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="yog-city" className="block text-xs mb-1.5" style={{ color: '#94a3b8' }}>Place of Birth *</label>
            <CityInput id="yog-city" value={form.placeQuery} error={errors.city}
              onSelect={(city, lat, lng, tz) =>
                setForm(p => ({ ...p, placeQuery: city, city, latitude: lat, longitude: lng, timezone: tz }))} />
          </div>
        </div>

        {form.unknownTime && (
          <p className="text-xs mt-4 p-3 rounded-lg" style={{ background: GOLD_RGBA(0.06), color: '#94a3b8' }}>
            Time ke bina lagna aur houses badal sakte hain, isliye score approximate rahega. Sahi samay se
            result kaafi zyada bharosemand hota hai.
          </p>
        )}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full mt-5 py-3 rounded-lg font-semibold text-sm transition disabled:opacity-50"
          style={{ background: GOLD, color: '#0B0F1A' }}>
          {loading ? 'Chart padha ja raha hai…' : config.ctaLabel}
        </button>

        {apiError && <p className="text-red-400 text-sm mt-3 text-center">{apiError}</p>}
      </section>

      {/* ── RESULT ─────────────────────────────────────────────── */}
      {r && data && (
        <div ref={resultRef}>

          {/* v2.2 — Santan leads with the answer, then the summary, then the
              locks (free) or the dates/count/upay (paid). The generic score +
              rule-row view follows for paid readers only. */}
          {config.type === 'santan' && <SantanView r={r} paid={paid} />}

          {/* Score. Hidden on santan FREE: a bare "51 / 100" on this subject
              reads as a verdict on the person, and the plain verdict above
              already carries the answer. Paid still sees it. */}
          {!(config.type === 'santan' && !paid) && (
          <section className="rounded-2xl p-6 mb-6 text-center"
            style={{ background: '#0B0F1A', border: `1px solid ${GOLD_RGBA(0.25)}` }}>
            <p className="text-xs uppercase tracking-widest m-0" style={{ color: '#64748b' }}>{config.scoreLabel}</p>
            <p className="m-0 leading-none" style={{ fontSize: '58px', fontWeight: 800, color: bandColor(r.band) }}>
              {r.score}
              <span style={{ fontSize: '20px', color: '#475569' }}> / 100</span>
            </p>
            <p className="m-0 mt-1 text-lg font-semibold" style={{ color: bandColor(r.band) }}>
              {r.band} · {r.bandHi}
            </p>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-4 text-xs" style={{ color: '#64748b' }}>
              <span>Lagna: <b style={{ color: '#94a3b8' }}>{data.chart.lagna}</b></span>
              {data.chart.dasamsaLagna && <span>D-10 Lagna: <b style={{ color: '#94a3b8' }}>{data.chart.dasamsaLagna}</b></span>}
              {data.chart.navamsaLagna && <span>D-9 Lagna: <b style={{ color: '#94a3b8' }}>{data.chart.navamsaLagna}</b></span>}
              <span>Dasha: <b style={{ color: '#94a3b8' }}>{data.chart.mahadasha}–{data.chart.antardasha}</b></span>
              {data.chart.saptamsaLagna && <span>D-7 Lagna: <b style={{ color: '#94a3b8' }}>{data.chart.saptamsaLagna}</b></span>}
            </div>
          </section>
          )}

          {/* The differentiator. For santan this is the WORKING, not the
              product, so the free reader never sees it — santanFreeShape in
              the route does not even send the rows. */}
          {!(config.type === 'santan' && !paid) && (
          <section className="rounded-2xl p-5 md:p-6 mb-6"
            style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-base font-bold m-0 mb-1" style={{ color: GOLD }}>{config.breakdownHeading}</h2>
            <p className="text-xs m-0 mb-3" style={{ color: '#64748b' }}>
              Har point ke saath wajah aur asli number diya gaya hai — sirf score nahi.
            </p>
            {paid
              ? r.rules.map((rule: ScoredRule, i: number) => <RuleRow key={i} r={rule} />)
              : (
                <>
                  {r.highlights.map((rule: ScoredRule, i: number) => <RuleRow key={i} r={rule} />)}
                  {r.rules.map((rule: LockedRule, i: number) => <LockedRow key={i} r={rule} />)}
                </>
              )}
          </section>
          )}

          {/* Blockers — the reason people pay, so the free view names them and stops. */}
          {r.blockers?.length > 0 && (
            <section className="rounded-2xl p-5 mb-6"
              style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <h2 className="text-base font-bold m-0 mb-3" style={{ color: '#FCA5A5' }}>Kya rok raha hai</h2>
              {r.blockers.map((b: any, i: number) => (
                <div key={i} className="mb-3 last:mb-0">
                  <p className="text-sm font-semibold m-0 mb-1" style={{ color: '#e2e8f0' }}>{b.label}</p>
                  <p className="text-xs leading-relaxed m-0" style={{ color: '#94a3b8' }}>
                    <Rich text={paid ? b.reason : b.teaser} />
                    {!paid && <span style={{ color: GOLD }}> — iska aapke liye kya matlab hai, wo report mein.</span>}
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* Direction or routes */}
          {secondary && secondary.length > 0 && (
            <section className="rounded-2xl p-5 mb-6"
              style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-base font-bold m-0 mb-1" style={{ color: GOLD }}>
                {config.secondaryHeading ?? 'Kaunsa raasta khula hai'}
              </h2>
              {/* Without this line the numbers below read as if they were the
                  main score. They are not — they rank the options against each
                  other, so a 64 here next to an overall 34 is not a
                  contradiction. */}
              <p className="text-xs m-0 mb-3" style={{ color: '#64748b' }}>
                Ye alag paimana hai. Ye rasto ko aapas mein tolta hai — upar wale score se iski tulna na karein.
              </p>
              {secondary.map((d: any, i: number) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold m-0" style={{ color: '#e2e8f0' }}>{d.track ?? d.route}</p>
                    <span className="text-xs font-mono" style={{ color: GOLD }}>{d.score}</span>
                  </div>
                  <p className="text-xs m-0 mt-0.5" style={{ color: '#94a3b8' }}><Rich text={d.reason} /></p>
                </div>
              ))}
            </section>
          )}

          {/* Origin hints — foreign spouse only */}
          {r.directionHints && r.directionHints.length > 0 && (
            <section className="rounded-2xl p-5 mb-6"
              style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-base font-bold m-0 mb-3" style={{ color: GOLD }}>
                {config.hintsHeading ?? 'Jeevansaathi kahan se'}
              </h2>
              {r.directionHints.map((h: any, i: number) => (
                <div key={i} className="mb-3 last:mb-0">
                  <p className="text-sm font-semibold m-0 mb-1" style={{ color: '#e2e8f0' }}>{h.hint}</p>
                  <p className="text-xs m-0" style={{ color: '#94a3b8' }}><Rich text={h.reason} /></p>
                </div>
              ))}
            </section>
          )}

          {/* Timing */}
          {r.timing && r.timing.length > 0 && (
            <section className="rounded-2xl p-5 mb-6"
              style={{ background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="text-base font-bold m-0 mb-3" style={{ color: GOLD }}>Samay</h2>
              {r.timing.map((t: any, i: number) => (
                <div key={i} className="mb-3 last:mb-0">
                  <p className="text-sm font-semibold m-0 mb-1" style={{ color: '#e2e8f0' }}>{t.period}</p>
                  <p className="text-xs m-0" style={{ color: '#94a3b8' }}><Rich text={t.why} /></p>
                </div>
              ))}
            </section>
          )}

          {/* Locked preview + checkout */}
          {!paid && (
            <section className="rounded-2xl p-5 md:p-6 mb-6"
              style={{ background: GOLD_RGBA(0.07), border: `1px solid ${GOLD_RGBA(0.35)}` }}>
              <h2 className="text-base font-bold m-0 mb-1 text-center" style={{ color: GOLD }}>
                Poori report mein kya milega
              </h2>
              <p className="text-xs text-center m-0 mb-4" style={{ color: '#94a3b8' }}>
                {config.type === 'santan'
                  ? 'Aapka chart padha ja chuka hai. Jawab upar hai — baaki teen cheezein report mein khulti hain.'
                  : 'Aapka chart padha ja chuka hai. Upar jo teen findings dikhe, wo isi reading se hain.'}
              </p>

              <ul className="text-sm space-y-2 mb-5 max-w-md mx-auto m-0 p-0" style={{ listStyle: 'none', color: '#cbd5e1' }}>
                {config.type === 'santan' ? (
                  /* v2.3: santan sends no rules and no blockers, so the generic
                     counters below printed zeroes. These bullets name what the
                     three locks above actually contain. */
                  <>
                    {Array.isArray(r.locks) && r.locks.map((l: any) => (
                      <li key={l.key}>✓ {l.title}</li>
                    ))}
                    <li>✓ Poora vishleshan — kaunsa graha sahara de raha hai aur kaunsa rok raha hai, wajah ke saath</li>
                  </>
                ) : (
                  <>
                    <li>✓ Baaki <b style={{ color: GOLD }}>{r.lockedCount}</b> rules ki poori wajah, har ek ka asli number ke saath</li>
                    <li>✓ <b style={{ color: GOLD }}>{r.blockers?.length ?? 0}</b> blockers ka poora vishleshan — kya rok raha hai aur kyun</li>
                    {r.directionNames?.length > 0 && (
                      <li>✓ {r.directionNames.length} rasto ki ranking wajah ke saath — {r.directionNames.slice(0, 3).join(', ')}…</li>
                    )}
                    {r.timingCount > 0 && <li>✓ Dasha timing — abhi kaunsi window chal rahi hai</li>}
                    {r.directionHintCount > 0 && (
                      <li>✓ {config.hintsTeaser ?? 'Disha aur sanskriti ke sanket'}</li>
                    )}
                  </>
                )}
              </ul>

              {isIndia === false ? (
                <PayPalCheckout
                  productKey="yog"
                  onPaid={onPayPalPaid}
                  onError={(m) => setApiError(m)}
                />
              ) : (
                <div className="text-center">
                  <button onClick={payWithRazorpay} disabled={paying}
                    className="inline-block px-7 py-3 rounded-lg font-semibold text-sm disabled:opacity-50"
                    style={{ background: GOLD, color: '#0B0F1A' }}>
                    {paying ? 'Ruko…' : 'Poori report kholein — ₹51'}
                  </button>
                  <p className="text-xs mt-2 m-0" style={{ color: '#64748b' }}>
                    One-time · Instant · Razorpay secure
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Next step — shown only AFTER unlocking, and only for a DIFFERENT
              product. Getting this wrong is expensive: the first version
              repeated the same sentence as both heading and button at the same
              ₹51, so someone who had just paid read it as "pay again" and
              assumed their payment had failed. It now confirms the purchase
              first, then names the other product explicitly. */}
          {paid && (
          <section className="rounded-2xl p-5 md:p-6 mb-6 text-center"
            style={{ background: GOLD_RGBA(0.07), border: `1px solid ${GOLD_RGBA(0.3)}` }}>
            <p className="text-xs m-0 mb-3" style={{ color: '#86EFAC' }}>
              ✓ Payment ho gaya. Poori report upar khul chuki hai.
            </p>
            {config.showNextStep === false ? null : (
              <>
                <h2 className="text-base font-bold m-0 mb-2" style={{ color: GOLD }}>
                  {r.nextStep?.title ?? 'Aage kya?'}
                </h2>
                <p className="text-xs leading-relaxed m-0 mb-4 max-w-xl mx-auto" style={{ color: '#94a3b8' }}>
                  {r.nextStep?.body ?? config.ctaBlurb}
                </p>
                <Link href={r.nextStep?.href ?? config.ctaHref}
                  className="inline-block px-6 py-3 rounded-lg font-semibold text-sm"
                  style={{ background: GOLD, color: '#0B0F1A' }}>
                  {r.nextStep ? `Kundali Milan — ${r.nextStep.price}` : `Trikaal Ka Sandesh — ${config.ctaPrice}`}
                </Link>
                <p className="text-xs m-0 mt-2" style={{ color: '#64748b' }}>
                  Ye alag reading hai — poori kundali, saare jeevan-kshetra.
                </p>
              </>
            )}
          </section>
          )}

          {/* Always rendered. The engine returns it on every call. */}
          <p className="text-xs text-center leading-relaxed mb-4" style={{ color: '#475569' }}>
            {r.disclaimer}
          </p>
        </div>
      )}
    </>
  );
}
