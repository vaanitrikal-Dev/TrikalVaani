'use client';

// 🔱 TRIKAAL VAANI | app/swapna/reading/SwapnaReadingForm.tsx | v1.1 (29 Aug 2026)
// Owner: Rohiit Gupta, Chief Vedic Architect
//
// v1.1 — INTERNATIONAL PAYMENT. Visitors outside India see PayPal at $7
// instead of the ₹51 Razorpay button; Razorpay on this account rejects
// foreign cards, so they previously could not buy at all. Everything after
// the money is taken now lives in generateReading() and is shared by both
// paths — the situationNote, the predict payload and the error copy must be
// identical for a rupee buyer and a dollar buyer. /api/predict already
// accepts paypalVerification (route v15.3), so no backend change was needed.
// DEDICATED paid dream-reading form — fully ISOLATED from BirthForm.tsx.
// Reuses (no touch): swapna_dream domain, CityInput, razorpay-helper,
// /api/create-order, /api/verify-payment, /api/predict, /report/[slug].
// The dream + its free meaning arrive via sessionStorage (set by SwapnaClient).
// ----------------------------------------------------------------------------

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CityInput from '@/components/calculators/CityInput';
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay-helper';
import PayPalCheckout from '@/components/payment/PayPalCheckout';

type Lang = 'english' | 'hindi' | 'hinglish';
interface DreamCtx { dream: string; meaning: string; symbol: string; language: Lang; }

const ANALYZING_STEPS = [
  'Casting your birth chart on Swiss Ephemeris…',
  'Finding your Moon and its nakshatra…',
  'Reading your running Mahadasha–Antardasha…',
  'Weighing your dream against your chart…',
  'Composing your personal reading…',
];

const C = {
  night: '#080B12', panel: '#0E141F', panel2: 'rgba(11,16,26,0.7)',
  gold: '#D4AF37', goldDeep: '#A8820A', goldSoft: 'rgba(212,175,55,0.55)',
  line: 'rgba(212,175,55,0.16)', line2: 'rgba(212,175,55,0.3)',
  s3: '#CBD5E1', s4: '#94A3B8', s5: '#64748B',
};

function segmentFromDob(dob: string): 'genz' | 'millennial' | 'genx' {
  const age = new Date().getFullYear() - new Date(dob).getFullYear();
  if (age <= 28) return 'genz';
  if (age <= 44) return 'millennial';
  return 'genx';
}
function ageFromDob(dob: string): number {
  return Math.max(0, new Date().getFullYear() - new Date(dob).getFullYear());
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 15,
  background: '#0d1120', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0',
  colorScheme: 'dark', outline: 'none',
};
const labelStyle: React.CSSProperties = { fontSize: 12, color: C.s4, marginBottom: 6, display: 'block', letterSpacing: '0.03em' };

export default function SwapnaReadingForm() {
  const router = useRouter();
  const [ctx, setCtx] = useState<DreamCtx | null>(null);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [tob, setTob] = useState('12:00');
  const [unknownTime, setUnknownTime] = useState(false);
  const [city, setCity] = useState('');
  const [geo, setGeo] = useState<{ lat: number; lng: number; tz: number } | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!analyzing) return;
    const t = setInterval(() => setStep((s) => (s + 1) % ANALYZING_STEPS.length), 3500);
    return () => clearInterval(t);
  }, [analyzing]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('tv_swapna_dream');
      if (raw) setCtx(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // No dream in session → send them back to decode one first
  if (!ctx) {
    return (
      <div style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center', padding: '0 16px' }}>
        <p style={{ color: C.s4, fontSize: '1.05rem' }}>
          Start with your dream, then unlock its personal reading.
        </p>
        <a href="/swapna" style={{ display: 'inline-block', marginTop: 16, padding: '12px 26px', borderRadius: 999,
          background: `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`, color: '#100B02', fontWeight: 700, textDecoration: 'none' }}>
          Decode my dream →
        </a>
      </div>
    );
  }

  // Payment done → interactive ~60s analysis screen
  if (analyzing) {
    return (
      <div style={{ maxWidth: 480, margin: '10px auto', textAlign: 'center', padding: '0 16px' }}>
        <div className="sw-orb" style={{ width: 92, height: 92, margin: '0 auto', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40,
          background: 'radial-gradient(circle at 50% 35%, #1a2230, #0b101a)', border: `2px solid ${C.line2}`,
          boxShadow: '0 0 40px rgba(212,175,55,0.35)' }}>🔱</div>
        <h2 style={{ fontFamily: 'serif', fontSize: '1.5rem', color: '#fff', marginTop: 24 }}>
          Reading your dream against your stars…
        </h2>
        <p style={{ color: C.gold, fontSize: '1.02rem', marginTop: 14, minHeight: 26, transition: 'opacity .3s' }}>
          {ANALYZING_STEPS[step]}
        </p>
        <div style={{ height: 4, borderRadius: 999, overflow: 'hidden', background: 'rgba(212,175,55,0.12)', margin: '22px auto 0', maxWidth: 300 }}>
          <div className="sw-bar" style={{ height: '100%', background: `linear-gradient(90deg, ${C.goldDeep}, ${C.gold})` }} />
        </div>
        <p style={{ color: C.s4, fontSize: 13.5, marginTop: 20, lineHeight: 1.6 }}>
          This deep, chart-personalised reading takes about <b style={{ color: C.s3 }}>60 seconds</b>.<br />
          Please keep this page open — your reading is being written just for you.
        </p>
        <style>{`
          @keyframes sw-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.06);opacity:.85} }
          @keyframes sw-slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
          .sw-orb { animation: sw-pulse 2.4s ease-in-out infinite; }
          .sw-bar { width: 28%; animation: sw-slide 1.6s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce){ .sw-orb,.sw-bar{animation:none} }
        `}</style>
      </div>
    );
  }

  function validate(): string | null {
    if (!name.trim()) return 'Please enter your name.';
    if (!gender) return 'Please select your gender.';
    if (!dob) return 'Please enter your date of birth.';
    if (!unknownTime && !tob) return "Please enter your time of birth, or tick “I don't know”.";
    if (!city || !geo) return 'Please pick your place of birth from the suggestions.';
    return null;
  }

  // v1.1 — international. Razorpay on this account rejects foreign cards, so a
  // visitor outside India is shown PayPal ($7) instead. `?intl=1` forces the
  // PayPal view for testing from India; one-way, rupees to dollars only.
  const [isIndia, setIsIndia] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    const forced = typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('intl') === '1';
    if (forced) { setIsIndia(false); return; }
    fetch('/api/geo').then(r => r.json())
      .then(g => { if (!cancelled) setIsIndia(g?.isIndia !== false); })
      .catch(() => { if (!cancelled) setIsIndia(true); });
    return () => { cancelled = true; };
  }, []);

  /**
   * Everything after the money is taken. Shared by both payment paths so the
   * prompt, the situationNote and the error copy cannot drift between them —
   * a rupee buyer and a dollar buyer must receive the identical reading.
   */
  async function generateReading(payment: {
    paymentVerification?: any;
    paypalVerification?: any;
  }) {
    setAnalyzing(true);

    const situationNote = (
      `My dream: "${ctx!.dream}". ` +
      `Classical Swapna Shastra meaning of ${ctx!.symbol || 'this symbol'}: ${ctx!.meaning || 'as recorded in the tradition'}. ` +
      `Please tell me what this dream means for my own life, read against my chart and running dasha.`
    ).slice(0, 500);

    const seg = segmentFromDob(dob);
    const body = {
      sessionId: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `swapna_${Date.now()}`,
      domainId: 'swapna_dream',
      domainLabel: 'Dream Reading',
      predictionTier: 'paid',
      paymentVerification: payment.paymentVerification ?? null,
      paypalVerification:  payment.paypalVerification ?? null,
      birthData: {
        name: name.trim(), dob,
        tob: unknownTime ? '12:00' : tob,
        lat: geo!.lat, lng: geo!.lng, cityName: city,
        timezone: geo!.tz, ayanamsa: 'lahiri',
      },
      userContext: {
        segment: seg, dynamicSegment: seg, gender,
        age: ageFromDob(dob),
        employment: 'other', sector: 'general',
        language: ctx!.language || 'hinglish',
        city, currentCity: city, relationshipStatus: '',
        situationNote, mobile: '',
      },
      person2Data: null,
    };

    const predRes = await fetch('/api/predict', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await predRes.json().catch(() => ({}));
    if (!predRes.ok) {
      setAnalyzing(false);
      setErr((data && data.error) || 'Reading could not be generated. Your payment is safe — please contact support.');
      setBusy(false); return;
    }

    const slug = data?._meta?.publicSlug ?? data?.publicSlug ?? null;
    try { sessionStorage.removeItem('tv_swapna_dream'); } catch { /* ignore */ }
    if (slug) router.push(`/report/${slug}`);
    else { setAnalyzing(false); setErr('Reading ready but not saved — please contact support with your payment id.'); setBusy(false); }
  }

  /** PayPal has taken $7. predict re-verifies with PayPal before generating. */
  async function onPayPalPaid(proof: { paypal_order_id: string; usdCents: number }) {
    const v = validate();
    if (v) { setErr(v); return; }
    setErr(''); setBusy(true);
    try {
      await generateReading({
        paypalVerification: { paypal_order_id: proof.paypal_order_id, amount: proof.usdCents },
      });
    } catch (e: any) {
      setAnalyzing(false);
      setErr(e?.message || 'Something went wrong. Your payment is safe — please contact support.');
      setBusy(false);
    }
  }

  async function pay() {
    const v = validate();
    if (v) { setErr(v); return; }
    setErr(''); setBusy(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) { setErr('Payment could not load. Please check your connection.'); setBusy(false); return; }

      const orderRes = await fetch('/api/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'deep' }),
      });
      if (!orderRes.ok) {
        const e = await orderRes.json().catch(() => ({}));
        setErr(e.error || 'Could not start payment. Please try again.'); setBusy(false); return;
      }
      const { orderId, amount, currency, keyId } = await orderRes.json();

      openRazorpayCheckout({
        keyId, orderId, amount, currency,
        name: 'Trikaal Vaani',
        description: 'Swapna Shastra — Personal Dream Reading',
        prefillName: name.trim(),
        themeColor: '#D4AF37',
        onDismiss: () => setBusy(false),
        onSuccess: async (response) => {
          // 1) verify signature server-side
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          if (!verifyRes.ok) {
            const e = await verifyRes.json().catch(() => ({}));
            setErr(e.error || 'Payment verification failed. Please contact support.'); setBusy(false); return;
          }

          // payment done → the shared generator takes it from here, so the
          // rupee and dollar buyers receive byte-identical readings.
          await generateReading({
            paymentVerification: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount, // 5100 — predict re-checks this
            },
          });
        },
      });
    } catch (e: any) {
      setErr(e?.message || 'Something went wrong. Please try again.');
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px' }}>
      {/* dream recap */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: '16px 18px', marginBottom: 22 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.goldSoft, marginBottom: 6 }}>Your dream</div>
        <p style={{ margin: 0, color: C.s3, fontSize: '0.98rem', fontStyle: 'italic' }}>&ldquo;{ctx.dream}&rdquo;</p>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label style={labelStyle} htmlFor="sw-name">Your name</label>
          <input id="sw-name" style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        </div>

        <div>
          <label style={labelStyle} htmlFor="sw-gender">Gender</label>
          <select id="sw-gender" style={inputStyle} value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="" style={{ background: '#0d1120' }}>Select</option>
            <option value="male" style={{ background: '#0d1120' }}>Male</option>
            <option value="female" style={{ background: '#0d1120' }}>Female</option>
            <option value="other" style={{ background: '#0d1120' }}>Other</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle} htmlFor="sw-dob">Date of birth</label>
            <input id="sw-dob" type="date" style={inputStyle} value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle} htmlFor="sw-tob">Time of birth</label>
            <input id="sw-tob" type="time" style={{ ...inputStyle, opacity: unknownTime ? 0.5 : 1 }} value={tob} disabled={unknownTime} onChange={(e) => setTob(e.target.value)} />
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: C.s4, marginTop: -6, cursor: 'pointer' }}>
          <input type="checkbox" checked={unknownTime} onChange={(e) => setUnknownTime(e.target.checked)} />
          I don&apos;t know my exact birth time (we&apos;ll use noon)
        </label>

        <div>
          <label style={labelStyle} htmlFor="sw-pob">Place of birth</label>
          <CityInput
            id="sw-pob"
            value={city}
            onSelect={(c, lat, lng, tz) => { setCity(c); setGeo({ lat, lng, tz }); }}
          />
        </div>

        {err && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', color: '#fca5a5', fontSize: 13.5 }}>
            {err}
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 12.5, color: C.goldSoft, marginTop: 4 }}>
          ⏳ Your personal reading is written live against your chart — it takes about <b style={{ color: C.s3 }}>60 seconds</b> after payment.
        </p>

        {/* v1.1 — currency follows the visitor. */}
        {isIndia === false ? (
          <div style={{ marginTop: 6 }}>
            <PayPalCheckout
              productKey="swapna"
              onPaid={onPayPalPaid}
              onError={(m) => setErr(m)}
              disabled={busy}
              onBeforeCreate={() => { const v = validate(); if (v) { setErr(v); return false; } return true; }}
            />
          </div>
        ) : (
          <button
            onClick={pay}
            disabled={busy}
            style={{
              marginTop: 6, padding: '15px 20px', borderRadius: 999, border: 'none',
              background: busy ? '#5b4a12' : `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`,
              color: '#100B02', fontWeight: 800, fontSize: 15.5,
              cursor: busy ? 'wait' : 'pointer',
              boxShadow: '0 12px 30px rgba(168,130,10,0.35)',
            }}>
            {busy ? '⟳ Opening secure payment…' : 'Reveal my personal reading · Pay ₹51 →'}
          </button>
        )}

        <p style={{ textAlign: 'center', fontSize: 11.5, color: C.s5, marginTop: 2 }}>
          {isIndia === false
            ? '🔒 One-time $7 · Secured by PayPal, or pay by card without a PayPal account · Read against your real Swiss Ephemeris chart'
            : '🔒 One-time ₹51 · Secured by Razorpay · Read against your real Swiss Ephemeris chart'}
        </p>
      </div>
    </div>
  );
}
