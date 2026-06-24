'use client';

// ============================================================
// File: app/calculators/free-child-birth-muhurat-calculator/page.tsx
// Version: v1.5 — full_day OFF on main scan (timeout fix) + v1.4 time-parse fix
// VM endpoint: /muhurat-finder (free) | paid via /api/create-muhurat-order
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Changelog:
//   v1.5 (2026-06-24) — PERF/BUGFIX: the main muhurat scan no longer
//        requests full_day. The VM was scanning the chosen window PLUS a
//        full 24h (~144 extra slots) on every submit, just to populate the
//        collapsed "whole day" educational block — ~7x heavier, which
//        intermittently exceeded the 45s timeout ("Calculation timed
//        out"). Window-only scan now. The educational block won't render
//        until we wire it as a lazy on-open second call. (Builds on v1.4.)
//   v1.4 (2026-06-24) — BUGFIX (paid flow): the chosen muhurat time was
//        parsed via best.time.split(':') + parseInt, which silently
//        dropped the AM/PM suffix. The VM returns a 12-hour string
//        ("9:30 AM" / "2:35 PM"), so every PM muhurat was sent to the
//        paid report API as its AM equivalent (2:35 PM -> hour 2 = 02:35).
//        Added parseTimeTo24h() which correctly converts BOTH 12-hour
//        ("h:mm AM/PM") and 24-hour ("HH:mm") strings to 24-hour numbers.
//        Only the paid-order time parse changed; no UI/payment/free-calc
//        logic touched.
//   v1.3 (2026-06-02) — Replaced standalone 1-node FAQPage script with
//        buildCalcJsonLd() helper (8 @id-linked nodes: Organization+real
//        sameAs, WebSite, linkable Person /founder, WebPage isPartOf
//        #website, BreadcrumbList, WebApplication price 0, HowTo,
//        FAQPage). Added `.tv-aeo-answer` class to above-fold answer for
//        speakable. Brand fix: visible/schema brand normalised to the
//        double-a spelling (incl. Razorpay checkout display name); legal
//        single-a kept inside helper only. No payment/logic/UI change.
//   v1.2 — Added post-payment progress wait-screen (anti-anxiety UX).
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay-helper';
import { buildCalcJsonLd } from '@/lib/seo/calcJsonLd';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

interface PlaceSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

// ─── Google Maps via /api/maps-proxy ──────────────────────────
async function fetchPlaceSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (query.length < 3) return [];
  try {
    const res = await fetch(
      `/api/maps-proxy?url=${encodeURIComponent('https://places.googleapis.com/v1/places:autocomplete')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: query, languageCode: 'en' }),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.suggestions ?? [])
      .filter((s: any) => s.placePrediction)
      .map((s: any) => ({
        place_id: s.placePrediction.placeId ?? '',
        description: s.placePrediction.text?.text ?? '',
        main_text: s.placePrediction.structuredFormat?.mainText?.text ?? s.placePrediction.text?.text ?? '',
        secondary_text: s.placePrediction.structuredFormat?.secondaryText?.text ?? '',
      }));
  } catch { return []; }
}

async function fetchPlaceDetails(placeId: string): Promise<{ lat: number; lng: number; city: string } | null> {
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

function PlaceInput({ id, placeholder, onSelect, error }: {
  id: string; placeholder: string;
  onSelect: (city: string, lat: number, lng: number, timezone: number) => void;
  error?: string;
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        <input id={id} type="search" autoComplete="off" placeholder={placeholder}
          value={query} onChange={e => handleChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg text-sm outline-none pr-10"
          style={{ background: '#0d1120', border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, color: '#e2e8f0', colorScheme: 'dark' }} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
          {loading ? <span style={{ color: GOLD }}>⟳</span> : selected ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: '#475569' }}>🏥</span>}
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

// ─── Robust 12h / 24h time parser ─────────────────────────────
// The VM returns the display time as a 12-hour string e.g. "9:30 AM"
// or "2:35 PM". Splitting on ":" and parseInt() silently dropped the
// AM/PM, so every PM muhurat was sent to the paid report as its AM
// twin. This converts BOTH "h:mm AM/PM" and 24-hour "HH:mm" strings
// to correct 24-hour numbers (handles 12 AM -> 0 and 12 PM -> 12).
function parseTimeTo24h(timeStr: string | undefined | null): { hour: number; minute: number } {
  const m = (timeStr || '').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return { hour: 0, minute: 0 };
  let hour = parseInt(m[1], 10);
  const minute = parseInt(m[2], 10);
  const ampm = (m[3] || '').toUpperCase();
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  return { hour, minute };
}

const FAQS = [
  { q: 'C-section ke liye shubh muhurat kaise nikalta hai?', a: 'C-section ya planned delivery ka muhurat aapke doctor dwara di gayi safe time window ke ANDAR nikala jaata hai. Trikaal Vaani har 10 minute ka Lagna, Nakshatra, Tithi, Yoga, aur 8th house check karke sabse auspicious slot batata hai — sirf us window mein jo doctor ne approve ki hai. Medical safety pehle, muhurat uske andar.' },
  { q: 'Kya yeh tool doctor ki advice replace karta hai?', a: 'Bilkul nahi. Delivery date aur safe time window 100% aapke doctor decide karte hain — maa aur bachche ki health ke according. Yeh tool sirf us approved window ke andar sabse shubh moment dhoondta hai. Yeh medical advice nahi hai.' },
  { q: 'Best nakshatra for baby birth kaunse hain?', a: 'Classical Jyotish ke according Pushya, Rohini, Hasta, Anuradha, aur Swati nakshatra child birth ke liye sabse auspicious mane jaate hain. Trikaal Vaani in sabhi ko score karta hai aur strong Lagna lord + clean 8th house ko bhi check karta hai.' },
  { q: 'Naamakshar (lucky name letter) kya hota hai?', a: 'Jis nakshatra aur pada mein bachcha paida hota hai, uske according ek shubh starting syllable (Naamakshar) milta hai — jaise "Cho", "La", "Mi". Iss syllable se shuru hone wala naam bachche ke liye auspicious mana jaata hai. Paid report mein hum boy + girl naam suggestions bhi dete hain.' },
  { q: 'Kya yeh IVF delivery ke liye bhi kaam karta hai?', a: 'Haan. Chahe C-section ho ya IVF embryo transfer/planned delivery — jab bhi date aur time pehle se decide ho sakti ho, yeh tool us window mein sabse shubh moment batata hai.' },
  { q: 'Result kitne accurate hain?', a: 'Trikaal Vaani Swiss Ephemeris (NASA-grade) + Lahiri Ayanamsha use karta hai, aur master-grade Muhurta logic se 9 factors check karta hai: Lagna nakshatra, Lagna lord ka house + dignity, 8th house affliction, kendra/trikona benefics, Moon strength, Yoga, Tithi, Karana, aur Rahu Kaal. Yeh wahi method hai jo experienced astrologers use karte hain.' },
];

interface SlotData {
  score: number;
  time: string;
  lagna_sign: string;
  lagna_lord: string;
  lagna_lord_house: number;
  lagna_lord_dignity: string;
  lagna_nakshatra: string;
  naamakshar: string;
  moon_nakshatra: string;
  tithi: string;
  yoga: string;
  karana: string;
  eighth_house_malefics: string[];
  reasons: string[];
  cautions: string[];
}

// ─── Post-payment progress steps (anti-anxiety wait-screen) ───
const REPORT_STEPS = [
  '✓ Payment safal — dhanyawad 🙏',
  '🪐 Grahon ki sookshma ganana ho rahi hai...',
  '🌙 Lagna aur Nakshatra nikaale ja rahe hain...',
  '📜 Trikaal aapke bachche ki kundli padh rahe hain...',
  '🔱 Maa Shakti ka aashirwad jod rahe hain...',
  '✨ Aapki report taiyaar ho rahi hai...',
];

export default function FreeChildBirthMuhuratPage() {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('13:00');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [timezone, setTimezone] = useState(5.5);
  // Hospital (optional) — overrides city coords when provided
  const [hospital, setHospital] = useState('');
  const [hospLat, setHospLat] = useState<number | null>(null);
  const [hospLng, setHospLng] = useState<number | null>(null);
  const [hospTz, setHospTz] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFullDay, setShowFullDay] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // ── Paid flow state ──
  const [payLang, setPayLang] = useState<'hinglish' | 'hindi' | 'english'>('hinglish');
  const [payTier, setPayTier] = useState<'report_101' | 'remedies_151'>('report_101');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  // ── Post-payment "generating report" overlay ──
  const [generating, setGenerating] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  // Rotate progress messages while the report is being generated
  useEffect(() => {
    if (!generating) { setStepIdx(0); return; }
    const t = setInterval(() => {
      setStepIdx((i) => (i < REPORT_STEPS.length - 1 ? i + 1 : i));
    }, 3500);
    return () => clearInterval(t);
  }, [generating]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!date) e.date = 'Delivery date is required';
    if (!startTime) e.start = 'Window start time required';
    if (!endTime) e.end = 'Window end time required';
    if (lat === null) e.place = 'Please select hospital/city from suggestions';
    if (startTime && endTime && endTime <= startTime) e.end = 'End time must be after start time';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validate()) return;
    const [year, month, day] = date.split('-').map(Number);
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const useLat = hospLat ?? lat;
    const useLng = hospLng ?? lng;
    const useTz = hospTz ?? timezone;
    setLoading(true);
    try {
      const res = await fetch('/api/calc/muhurat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year, month, day,
          window_start_hour: sh, window_start_minute: sm,
          window_end_hour: eh, window_end_minute: em,
          latitude: useLat, longitude: useLng, timezone: useTz,
          // full_day OFF on the main scan. The VM was also scanning a full
          // 24h day (~144 extra slots) on every submit just to populate the
          // collapsed "whole day" educational block — that ~7x heavier load
          // intermittently exceeded the 45s timeout. Window-only scan now.
          full_day: false,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Server error');
      }
      const data = await res.json();
      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Paid report: create order → Razorpay → verify → redirect ──
  const handleBuyReport = async () => {
    setPayError(null);
    if (!result || !best) return;

    const [year, month, day] = date.split('-').map(Number);
    // Use the best slot's time as the parent's CHOSEN delivery moment
    // (parseTimeTo24h handles the VM's 12-hour "h:mm AM/PM" format)
    const { hour: bh, minute: bm } = parseTimeTo24h(best.time);
    const useLat = hospLat ?? lat;
    const useLng = hospLng ?? lng;
    const useTz = hospTz ?? timezone;

    if (useLat === null || useLng === null) {
      setPayError('Location missing. Please re-run the calculator.');
      return;
    }

    setPayLoading(true);
    try {
      // 1) Load Razorpay script
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error('Could not load payment gateway. Please try again.');

      // 2) Create order
      const orderRes = await fetch('/api/create-muhurat-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: payTier,
          language: payLang,
          muhurat: {
            year, month, day,
            hour: bh, minute: bm,
            latitude: useLat, longitude: useLng, timezone: useTz,
            city, hospital,
          },
        }),
      });
      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}));
        throw new Error(err.error || 'Could not create order.');
      }
      const order = await orderRes.json();

      // 3) Open Razorpay popup
      openRazorpayCheckout({
        keyId:       order.keyId,
        orderId:     order.orderId,
        amount:      order.amount,
        currency:    order.currency,
        name:        'Trikaal Vaani',
        description: order.label,
        themeColor:  GOLD,
        onSuccess: async (resp) => {
          // Payment captured — immediately show the calming progress overlay
          setPayLoading(false);
          setGenerating(true);
          try {
            const verifyRes = await fetch('/api/verify-muhurat-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id:   resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature:  resp.razorpay_signature,
              }),
            });
            const vd = await verifyRes.json();
            if (vd.success && vd.slug) {
              window.location.href = `/muhurat/${vd.slug}`;
            } else {
              setGenerating(false);
              setPayError(vd.error || 'Payment verified but report could not be created. Please contact us on WhatsApp.');
            }
          } catch {
            setGenerating(false);
            setPayError('Payment done, but verification failed. Please contact us on WhatsApp — your payment is safe.');
          }
        },
        onDismiss: () => setPayLoading(false),
      });
    } catch (e: any) {
      setPayError(e?.message || 'Payment could not start. Please try again.');
      setPayLoading(false);
    }
  };

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    background: '#0d1120',
    border: `1px solid ${hasError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
    color: '#e2e8f0', colorScheme: 'dark' as const,
  });

  const best: SlotData | null = result?.best_slot || null;
  const topSlots: SlotData[] = result?.top_slots || [];
  const fullDay = result?.full_day || null;

  // ─── JSON-LD (gold-standard 8-node @graph via shared helper) ─
  const PAGE_URL = 'https://trikalvaani.com/calculators/free-child-birth-muhurat-calculator';
  const jsonLd = buildCalcJsonLd({
    pageUrl: PAGE_URL,
    name: 'Free Child Birth Muhurat Calculator — Auspicious C-Section & Delivery Time by Date',
    description:
      "Find the most auspicious delivery moment within your doctor's safe window — strong Lagna, favourable Nakshatra & Tithi, clean 8th house and lucky name letter. Free Vedic muhurat calculator by Trikaal Vaani.",
    breadcrumbName: 'Child Birth Muhurat Calculator',
    aboutEntities: ['Muhurta', 'Lagna', 'Nakshatra', 'Child Birth'],
    knowsAbout: ['Vedic Astrology', 'Jyotish Shastra', 'Muhurta', 'Electional Astrology'],
    howToName: 'How to find an auspicious child birth muhurat',
    howToSteps: [
      { name: 'Enter the doctor-approved window', text: "Enter the planned delivery date and the safe time window your doctor has approved, plus the city or hospital location." },
      { name: 'Analyse each slot', text: 'The calculator scores every slot in the window on Lagna, Nakshatra, Tithi, Yoga and 8th house using Swiss Ephemeris with Lahiri Ayanamsha.' },
      { name: 'Get your result', text: 'See the most auspicious moment inside the window, alternative good slots, the lucky name letter and favourable factors.' },
    ],
    faqs: FAQS,
  });

  return (
    <>
      <SiteNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ─── POST-PAYMENT GENERATING OVERLAY (anti-anxiety) ─── */}
      {generating && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6"
          style={{ background: 'rgba(8,11,18,0.94)', backdropFilter: 'blur(8px)' }}
        >
          {/* Spinning halo ring */}
          <div
            style={{
              width: 92, height: 92, borderRadius: '50%',
              border: `3px solid ${GOLD_RGBA(0.15)}`,
              borderTopColor: GOLD,
              animation: 'tvspin 1s linear infinite',
            }}
          />
          <div className="text-2xl mt-6 mb-2" style={{ color: GOLD }}>🔱</div>
          <p className="text-lg md:text-xl font-serif text-center" style={{ color: GOLD, minHeight: '2.4em' }}>
            {REPORT_STEPS[stepIdx]}
          </p>
          <p className="text-xs text-slate-400 mt-3 text-center max-w-xs">
            Aapka payment safe hai. Kripya yeh page band na karein — report 1–2 minute mein khul jayegi.
          </p>

          {/* Step dots */}
          <div className="flex gap-2 mt-6">
            {REPORT_STEPS.map((_, i) => (
              <span key={i} style={{
                width: 7, height: 7, borderRadius: '50%',
                background: i <= stepIdx ? GOLD : GOLD_RGBA(0.2),
                transition: 'background 0.4s',
              }} />
            ))}
          </div>

          <style>{`@keyframes tvspin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-4xl mx-auto">

          <nav className="text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/calculators" className="hover:text-slate-300">Calculators</Link>
            <span className="mx-2">›</span>
            <span style={{ color: GOLD }}>Child Birth Muhurat Calculator</span>
          </nav>

          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Free Child Birth Muhurat Calculator — Auspicious C-Section & Delivery Time by Date
          </h1>

          {/* GEO DIRECT ANSWER (40-60w) */}
          <div className="tv-aeo-answer rounded-xl p-5 mb-6" style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)` }}>
            <p className="text-base md:text-lg leading-relaxed">
              A <strong style={{ color: GOLD }}>child birth muhurat</strong> is the most auspicious moment to deliver a baby, chosen using Vedic astrology. For a planned C-section or IVF delivery, the muhurat is selected <strong>within the safe time window your doctor approves</strong> — based on a strong Lagna (ascendant), favourable Nakshatra and Tithi, and a clean 8th house. Trikaal Vaani finds the best slot inside that window using Swiss Ephemeris and BPHS classical rules.
            </p>
          </div>

          {/* SAFETY BANNER — EEAT trust signal */}
          <div className="rounded-xl p-4 mb-6 flex gap-3" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.3)' }}>
            <span className="text-xl">🩺</span>
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong style={{ color: '#93c5fd' }}>Medical safety comes first.</strong> Your doctor decides the delivery date and the safe time window based on the mother's and baby's health. This tool only finds the most auspicious moment <em>inside</em> that doctor-approved window. It is guidance to discuss with your doctor — not medical advice.
            </p>
          </div>

          {/* AUTHOR CARD — EEAT */}
          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: GOLD, color: '#080B12' }}>RG</div>
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · Trikaal Vaani · India</div>
              <div className="text-xs text-slate-500 mt-0.5">Engine: Swiss Ephemeris · BPHS Muhurta · Lahiri Ayanamsha · 9-Factor Master Analysis</div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'rgba(13,17,30,0.85)', border: '1px solid rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)' }}>
            <h2 className="text-xl md:text-2xl font-serif font-bold mb-5" style={{ color: GOLD }}>Find Your Auspicious Delivery Time (Free)</h2>
            <div className="grid gap-5">

              <div>
                <label htmlFor="m-date" className="block text-sm font-medium text-slate-300 mb-1.5">Delivery Date <span className="text-yellow-400">*</span> <span className="text-slate-500 text-xs">(as planned with your doctor)</span></label>
                <input id="m-date" type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.date)} />
                {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="m-start" className="block text-sm font-medium text-slate-300 mb-1.5">Window Start <span className="text-yellow-400">*</span></label>
                  <input id="m-start" type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.start)} />
                </div>
                <div>
                  <label htmlFor="m-end" className="block text-sm font-medium text-slate-300 mb-1.5">Window End <span className="text-yellow-400">*</span></label>
                  <input id="m-end" type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle(!!errors.end)} />
                  {errors.end && <p className="text-red-400 text-xs mt-1">{errors.end}</p>}
                </div>
              </div>
              <p className="text-xs text-slate-500 -mt-3">⏱️ Enter the time window your doctor has cleared as safe (e.g. 9:00 AM to 1:00 PM).</p>

              {/* WHY WE ASK — trust + accuracy explainer */}
              <div className="rounded-lg p-3" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
                <p className="text-xs text-slate-400 leading-relaxed">
                  📍 <strong style={{ color: GOLD }}>Why we ask for location:</strong> The ascendant (Lagna) — the most important factor in the muhurat — changes with exact birth coordinates. A precise hospital location gives the most accurate result. City alone works too.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">City of Birth <span className="text-yellow-400">*</span></label>
                <PlaceInput id="m-city" placeholder="Type city name..." error={errors.place}
                  onSelect={(c, la, ln, tz) => {
                    setCity(c); setLat(la); setLng(ln); setTimezone(tz);
                    setErrors(prev => { const n = { ...prev }; delete n.place; return n; });
                  }} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Hospital / Clinic <span className="text-slate-500 text-xs">(optional — for pinpoint accuracy)</span>
                </label>
                <PlaceInput id="m-hospital" placeholder="Type hospital or clinic name..."
                  onSelect={(c, la, ln, tz) => {
                    setHospital(c); setHospLat(la); setHospLng(ln); setHospTz(tz);
                  }} />
                {hospLat !== null && (
                  <p className="text-xs mt-1" style={{ color: '#22c55e' }}>✓ Using exact hospital location for maximum precision</p>
                )}
              </div>

              {lat !== null && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Latitude', value: (hospLat ?? lat).toFixed(4) },
                    { label: 'Longitude', value: (hospLng ?? lng!).toFixed(4) },
                    { label: 'Timezone', value: `UTC ${(hospTz ?? timezone) >= 0 ? '+' : ''}${hospTz ?? timezone}` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <label className="block text-xs text-slate-500 mb-1">{label}</label>
                      <div className="px-3 py-2 rounded-lg text-xs font-mono text-center"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#22c55e' }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}

              {error && <div className="px-4 py-3 rounded-lg text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: loading ? GOLD_RGBA(0.3) : `linear-gradient(135deg,rgba(212,175,55,0.8) 0%,${GOLD} 100%)`, color: '#080B12', fontSize: '15px' }}>
                {loading ? '⟳ Finding auspicious time...' : '🕉️ Find Auspicious Muhurat'}
              </button>

              <p className="text-center text-xs text-slate-600">🔒 100% Free · Swiss Ephemeris · BPHS Muhurta · Within your doctor's window</p>
            </div>
          </div>

          {/* RESULT */}
          {result && best && (
            <div ref={resultRef} className="mt-8 space-y-6">

              {/* BEST SLOT — primary recommendation */}
              <div className="rounded-2xl p-5 md:p-7 text-center" style={{
                background: `linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(2,8,23,0.6) 100%)`,
                border: `1px solid ${GOLD_RGBA(0.4)}`
              }}>
                <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">Most Auspicious Time (within your window)</div>
                <div className="text-5xl font-serif font-bold mb-2" style={{ color: GOLD }}>{best.time}</div>
                <div className="inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4"
                  style={{ background: GOLD_RGBA(0.15), color: GOLD, border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                  {result.best_band} · {best.score}/100
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-left">
                  <Cell label="Lagna" value={best.lagna_sign} />
                  <Cell label="Nakshatra" value={best.lagna_nakshatra} />
                  <Cell label="Tithi" value={best.tithi} />
                  <Cell label="Lucky Letter" value={best.naamakshar} highlight />
                </div>
              </div>

              {/* WHY THIS TIME */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl p-5" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#86EFAC' }}>✅ Favourable Factors</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    {best.reasons.map((r, i) => <li key={i} className="flex gap-2"><span className="text-green-400">•</span><span>{r}</span></li>)}
                  </ul>
                </div>
                {best.cautions.length > 0 && (
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <h4 className="text-lg font-serif font-bold mb-3" style={{ color: '#FCA5A5' }}>⚠️ Points of Caution</h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {best.cautions.map((c, i) => <li key={i} className="flex gap-2"><span className="text-red-400">•</span><span>{c}</span></li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* TOP ALTERNATIVE SLOTS */}
              {topSlots.length > 1 && (
                <div className="rounded-2xl p-5 md:p-7" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                  <h3 className="text-xl font-serif font-bold mb-4" style={{ color: GOLD }}>🕐 Other Good Times in Your Window</h3>
                  <div className="space-y-2">
                    {topSlots.slice(1, 5).map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg"
                        style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${GOLD_RGBA(0.12)}` }}>
                        <div>
                          <span className="font-bold text-base" style={{ color: GOLD }}>{s.time}</span>
                          <span className="text-xs text-slate-500 ml-3">{s.lagna_sign} Lagna · {s.lagna_nakshatra}</span>
                        </div>
                        <span className="text-sm font-mono" style={{ color: s.score >= 60 ? '#86EFAC' : s.score >= 45 ? GOLD : '#FCA5A5' }}>{s.score}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PAID CTA — ₹101 / ₹151 with Razorpay */}
              <div className="rounded-2xl p-6" style={{ background: `linear-gradient(135deg, rgba(212,175,55,0.12), rgba(2,8,23,0.5))`, border: `1px solid ${GOLD_RGBA(0.3)}` }}>
                <h3 className="text-xl font-serif font-bold mb-2 text-center" style={{ color: GOLD }}>🔮 Unlock the Full Muhurat Report</h3>
                <p className="text-sm text-slate-300 mb-5 max-w-xl mx-auto text-center">
                  A detailed life prediction for a child born at <strong style={{ color: GOLD }}>{best.time}</strong>, the lucky name letter with boy &amp; girl name suggestions, doshas to be aware of, and a downloadable report to share with your family.
                </p>

                {/* Tier selector */}
                <div className="grid grid-cols-2 gap-3 mb-4 max-w-md mx-auto">
                  <button onClick={() => setPayTier('report_101')}
                    className="rounded-xl p-4 text-left transition"
                    style={{
                      background: payTier === 'report_101' ? GOLD_RGBA(0.15) : 'rgba(2,8,23,0.4)',
                      border: `1px solid ${payTier === 'report_101' ? GOLD : GOLD_RGBA(0.2)}`,
                    }}>
                    <div className="font-bold text-lg" style={{ color: GOLD }}>₹101</div>
                    <div className="text-xs text-slate-400 mt-1">Full report + prediction + boy/girl names</div>
                  </button>
                  <button onClick={() => setPayTier('remedies_151')}
                    className="rounded-xl p-4 text-left transition relative"
                    style={{
                      background: payTier === 'remedies_151' ? GOLD_RGBA(0.15) : 'rgba(2,8,23,0.4)',
                      border: `1px solid ${payTier === 'remedies_151' ? GOLD : GOLD_RGBA(0.2)}`,
                    }}>
                    <div className="font-bold text-lg" style={{ color: GOLD }}>₹151</div>
                    <div className="text-xs text-slate-400 mt-1">Everything + all 10 personalised remedies</div>
                  </button>
                </div>

                {/* Language selector */}
                <div className="flex justify-center gap-2 mb-5">
                  {(['hinglish', 'hindi', 'english'] as const).map((l) => (
                    <button key={l} onClick={() => setPayLang(l)}
                      className="px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition"
                      style={{
                        background: payLang === l ? GOLD : 'rgba(255,255,255,0.05)',
                        color: payLang === l ? '#080B12' : '#94a3b8',
                        border: `1px solid ${payLang === l ? GOLD : 'rgba(255,255,255,0.1)'}`,
                      }}>
                      {l}
                    </button>
                  ))}
                </div>

                {payError && (
                  <div className="px-4 py-3 rounded-lg text-sm text-red-300 mb-4 max-w-md mx-auto" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>{payError}</div>
                )}

                <div className="text-center">
                  <button onClick={handleBuyReport} disabled={payLoading || generating}
                    className="px-8 py-3 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: GOLD, color: '#080B12' }}>
                    {payLoading ? '⟳ Opening payment...' : `Get Full Report · ${payTier === 'remedies_151' ? '₹151' : '₹101'}`}
                  </button>
                  <p className="text-center text-xs text-slate-600 mt-3">🔒 Secure payment via Razorpay · No refund policy</p>
                </div>
              </div>

              {/* FULL DAY — EDUCATIONAL, collapsed by default */}
              {fullDay && fullDay.best_slot && (
                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button onClick={() => setShowFullDay(!showFullDay)} className="w-full flex items-center justify-between text-left">
                    <span className="text-sm font-semibold text-slate-400">📚 Educational: most auspicious time across the whole day</span>
                    <span style={{ color: GOLD }}>{showFullDay ? '−' : '+'}</span>
                  </button>
                  {showFullDay && (
                    <div className="mt-4">
                      <div className="rounded-lg p-4 mb-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <p className="text-xs text-red-200 leading-relaxed">{fullDay.note}</p>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(2,8,23,0.4)' }}>
                        <span className="font-bold" style={{ color: GOLD }}>{fullDay.best_slot.time}</span>
                        <span className="text-xs text-slate-500">{fullDay.best_slot.lagna_sign} · {fullDay.best_slot.lagna_nakshatra}</span>
                        <span className="text-sm font-mono text-slate-400">{fullDay.best_slot.score}/100</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DISCLAIMER */}
              {result.disclaimer && (
                <p className="text-xs text-slate-500 leading-relaxed p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {result.disclaimer}
                </p>
              )}
            </div>
          )}

          {/* PILLAR CONTENT */}
          <section className="mt-16 prose prose-invert max-w-none">
            <h2 className="text-2xl font-serif font-bold mb-4" style={{ color: GOLD }}>Child Birth Muhurat Kya Hota Hai?</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              <strong style={{ color: GOLD }}>Child birth muhurat</strong> woh shubh samay hai jab bachche ka janam sabse favourable planetary alignment mein ho. Vedic Jyotish mein maana jaata hai ki janam ke samay ka Lagna, Nakshatra, aur grah sthiti bachche ke swabhav, health, aur bhavishya ko shape karte hain. C-section ya IVF mein, jab time pehle se choose kiya ja sakta hai, parents us shubh moment ko select kar sakte hain — lekin <strong>hamesha doctor ki approved safe window ke andar</strong>.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Muhurat Kis Cheez Par Depend Karta Hai? (9 Factors)</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Trikaal Vaani master-grade analysis karta hai: (1) Lagna Nakshatra ki quality — Pushya, Rohini, Hasta jaise auspicious nakshatra. (2) Lagna lord ka house — kendra/trikona mein strong. (3) Lagna lord ki dignity — exalted ya own sign. (4) 8th house affliction — malefic 8th house mein ho toh avoid. (5) Kendra/trikona mein benefics. (6) Moon ki strength. (7) Shubh Yoga. (8) Purna Tithi. (9) Rahu Kaal avoidance. Yeh sab milkar 0-100 ka muhurat score banate hain.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Naamakshar — Bachche Ka Lucky Naam Letter</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Har nakshatra ke 4 pada hote hain, aur har pada ka ek shubh starting syllable hota hai. Jaise Pushya nakshatra ke padas se "Hu", "He", "Ho", "Da" aate hain. Jis muhurat mein bachcha paida hota hai, uska Lagna nakshatra-pada bachche ke naam ka lucky letter decide karta hai. Trikaal Vaani ki paid report mein hum is letter se shuru hone wale auspicious boy aur girl names suggest karte hain.
            </p>

            <h2 className="text-2xl font-serif font-bold mb-4 mt-8" style={{ color: GOLD }}>Trikaal Vaani vs Other Muhurat Sites</h2>
            <div className="not-prose overflow-x-auto mb-6">
              <table className="w-full text-sm" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD}33`, borderRadius: '12px' }}>
                <thead>
                  <tr style={{ background: 'rgba(212,175,55,0.1)' }}>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Feature</th>
                    <th className="p-3 text-left" style={{ color: GOLD }}>Trikaal Vaani</th>
                    <th className="p-3 text-left text-slate-400">Others</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Personalised to your window</td><td className="p-3" style={{ color: GOLD }}>✓ Exact</td><td className="p-3 text-slate-500">✗ Generic date lists</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">8th house affliction check</td><td className="p-3" style={{ color: GOLD }}>✓ Yes</td><td className="p-3 text-slate-500">✗ No</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Instant result</td><td className="p-3" style={{ color: GOLD }}>✓ Seconds</td><td className="p-3 text-slate-500">✗ Manual consult</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Doctor-safety first</td><td className="p-3" style={{ color: GOLD }}>✓ Built-in</td><td className="p-3 text-slate-500">✗ Footnote</td></tr>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}><td className="p-3">Lucky name letter</td><td className="p-3" style={{ color: GOLD }}>✓ Naamakshar</td><td className="p-3 text-slate-500">✗ Missing</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Frequently Asked Questions</h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <details key={i} className="p-4 rounded-xl cursor-pointer" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <summary className="font-semibold" style={{ color: GOLD }}>{faq.q}</summary>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: GOLD }}>Aur Bhi Free Calculators</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { slug: 'free-kundali-calculator', name: 'Kundli Calculator' },
                { slug: 'free-dasha-calculator', name: 'Dasha Calculator' },
                { slug: 'free-nakshatra-calculator', name: 'Nakshatra Finder' },
                { slug: 'free-sade-sati-calculator', name: 'Sade Sati' },
                { slug: 'free-manglik-dosh-calculator', name: 'Manglik Dosh' },
                { slug: 'free-lagna-calculator', name: 'Lagna Calculator' },
              ].map((c) => (
                <Link key={c.slug} href={`/calculators/${c.slug}`}
                  className="p-3 rounded-xl text-center text-sm transition-all hover:scale-105"
                  style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', color: GOLD }}>
                  {c.name}
                </Link>
              ))}
            </div>
          </section>

        </div>
      </main>
    </>
  );
}

function Cell({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: 'rgba(2,8,23,0.4)', border: `1px solid ${highlight ? GOLD : GOLD_RGBA(0.15)}` }}>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="font-bold text-base" style={{ color: GOLD }}>{value || '—'}</div>
    </div>
  );
}
