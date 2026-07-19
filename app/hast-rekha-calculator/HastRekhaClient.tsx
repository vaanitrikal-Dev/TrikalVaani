'use client';

// ============================================================
// File: app/hast-rekha-calculator/HastRekhaClient.tsx
// Version: v2.1 — SHASTRA-CORRECT + HONEST-SALES REBUILD
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// CHANGE v2.1 (2026-07-19)
//   1. HANDEDNESS FIX (accuracy-critical): form now asks which hand
//      the user writes with. The DOMINANT hand is required; the other
//      is optional. Labels flip automatically. Previously we forced
//      the RIGHT palm — a left-handed user (~10% of users) was read
//      from the wrong hand, contradicting our own FAQ.
//      Payload: dominant image is sent in `right_palm_b64` (primary
//      slot, backward-compatible) + new `handedness` and
//      `dominant_palm_b64` fields. BACKEND TODO: read `handedness`.
//   2. "आठ पर्वतों" → "सात पर्वतों" (CEO decision v1.3: 7 parvat).
//   3. RATNA: engine's `shubh_ratna` text is NO LONGER rendered.
//      Replaced with an honest pointer card — "ratna Kundali se tay
//      hota hai" → gemstone suitability calculator (cross-sell that
//      keeps the anti-fear promise intact). BACKEND TODO: stop
//      generating shubh_ratna. 'Shubh Ratna Suggestion' removed from
//      the included list.
//   4. REVIEW screen: fabricated flattery ("aapki rekha itni vishesh
//      hai") replaced with the honest premium version — extra QC
//      because we refuse to ship a wrong report. Zero refund risk.
//   5. PRIVACY: honest line added under CTA (photo processed only,
//      never saved to our database/storage — verified in Supabase:
//      palmistry_reports has no image column; only PDFs stored).
//      NOTE: page.tsx FAQ still claims "browser session" — fix in
//      page.tsx v1.4 (next step).
//   6. Dead `dob` field removed (was in payload, had no input).
//   7. Compression 1200px → 1600px (fine lines: vivah rekha, small
//      signs survive). Quality 0.88.
//   8. Budh Rekha mention removed from SEO paragraph (official list
//      is 6 lines; engine doesn't read Budh Rekha yet).
//   9. Unused `observations` no longer destructured.
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';

declare global {
  interface Window { Razorpay: any; }
}

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'upload' | 'paying' | 'analyzing' | 'result' | 'review';
type Handedness = 'right' | 'left';

interface FAQ { q: string; a: string; }
interface FormState {
  userName: string;
  mobile: string;
  gender: 'M' | 'F';
  language: 'hi' | 'en' | 'hinglish';
  handedness: Handedness;
}
interface PalmImage { preview: string; b64: string; }
interface PalmResult {
  success: boolean;
  session_id: string;
  mp_features: Record<string, any>;
  scores: Record<string, number>;
  report: Record<string, any>;
  pdf_b64: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SCORE_META: Record<string, { label: string; icon: string }> = {
  vitality:     { label: 'जीवन शक्ति',  icon: '⚡' },
  career:       { label: 'करियर',        icon: '💼' },
  wealth:       { label: 'धन',           icon: '💰' },
  relationship: { label: 'प्रेम-विवाह',  icon: '❤️' },
  leadership:   { label: 'नेतृत्व',      icon: '👑' },
  creativity:   { label: 'सृजन',         icon: '🎨' },
  spirituality: { label: 'अध्यात्म',     icon: '🕉️' },
  health:       { label: 'स्वास्थ्य',    icon: '🌿' },
};

const ANALYZING_MSGS = [
  'हस्त रेखाएं स्कैन हो रही हैं...',
  'हाथ के 21 बिंदु extract हो रहे हैं...',
  'रेखाएं sharp की जा रही हैं...',
  'जीवन रेखा और मस्तिष्क रेखा पढ़ी जा रही हैं...',
  'हृदय रेखा और भाग्य रेखा का विश्लेषण...',
  'सात पर्वतों का अध्ययन हो रहा है...',
  'समुद्रिक शास्त्र के 40+ नियम लागू हो रहे हैं...',
  'आपके 8 जीवन आयाम गिने जा रहे हैं...',
  'Trikaal AI आपकी विस्तृत रिपोर्ट लिख रही है...',
  'अंतिम स्पर्श दिया जा रहा है...',
];

// ─── Utilities ────────────────────────────────────────────────────────────────

// v2.1: 1600px — vivah rekha and small signs are the first casualties
// of aggressive downscaling. Payload cost is acceptable; accuracy is not
// negotiable on a paid product.
async function compressImage(file: File, maxPx = 1600): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const ratio   = Math.min(1, maxPx / img.width, maxPx / img.height);
        const canvas  = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.88).split(',')[1]);
      } catch (e) { reject(e); }
      finally { URL.revokeObjectURL(url); }
    };
    img.onerror = reject;
    img.src = url;
  });
}

function scoreColor(v: number) {
  if (v >= 75) return '#22c55e';
  if (v >= 55) return GOLD;
  return '#f97316';
}
function scoreTag(v: number): string {
  if (v >= 80) return 'उत्तम';
  if (v >= 65) return 'शुभ';
  if (v >= 50) return 'मध्यम';
  return 'सुधार';
}

function downloadPDF(b64: string, name: string) {
  const bytes = atob(b64);
  const arr   = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  const blob  = new Blob([arr], { type: 'application/pdf' });
  const link  = document.createElement('a');
  link.href   = URL.createObjectURL(blob);
  link.download = `trikaal-vaani-hast-rekha-${name || 'report'}.pdf`;
  link.click();
}

// ─── Upload Zone ─────────────────────────────────────────────────────────────

function UploadZone({ image, onFile, label, sublabel, required, emoji }: {
  image: PalmImage | null; onFile: (f: File) => void; label: string; sublabel?: string; required?: boolean; emoji: string;
}) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef  = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-slate-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
        {!required && <span className="text-slate-500 ml-1 text-xs">(Optional — behtar reading)</span>}
      </label>
      {sublabel && <p className="text-xs text-slate-500 mb-2">{sublabel}</p>}
      <div
        className="rounded-2xl p-5 text-center transition-all min-h-[210px] flex flex-col items-center justify-center"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: image ? '2px dashed #22c55e' : `2px dashed ${required ? GOLD_RGBA(0.4) : 'rgba(255,255,255,0.12)'}`,
        }}
      >
        {image ? (
          <>
            <img src={image.preview} alt={`${label} — Hast Rekha palm photo`} className="max-h-36 rounded-lg object-cover" />
            <p className="text-green-400 text-sm mt-2">✓ Photo added</p>
            <button onClick={() => galleryRef.current?.click()}
              className="text-xs text-slate-500 hover:text-slate-300 mt-1.5 underline">
              Badlein
            </button>
          </>
        ) : (
          <>
            <div className="text-5xl mb-3">{emoji}</div>
            <p className="text-slate-400 text-sm mb-4">Apni haath ki photo add karein</p>
            <div className="flex gap-2.5 w-full max-w-xs">
              <button onClick={() => cameraRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`, color: '#080B12' }}>
                📷 Camera
              </button>
              <button onClick={() => galleryRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}`, color: GOLD_RGBA(0.9) }}>
                🖼️ Gallery
              </button>
            </div>
            <p className="text-slate-600 text-xs mt-3">JPG, PNG, WebP · Max 10MB</p>
          </>
        )}

        {/* Gallery picker — opens photo library */}
        <input ref={galleryRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={e => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />

        {/* Camera capture — opens back camera on mobile */}
        <input ref={cameraRef} type="file" accept="image/*" capture="environment"
          className="hidden"
          onChange={e => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
      </div>
    </div>
  );
}

// ─── Footer (Milan-style) ─────────────────────────────────────────────────────

function HastRekhaFooter() {
  return (
    <footer className="border-t mt-8" style={{ borderColor: GOLD_RGBA(0.1) }}>
      <div className="max-w-4xl mx-auto px-5 py-8 text-center text-xs text-slate-500">
        <p style={{ color: GOLD, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Trikaal Vaani</p>
        <p className="mt-2">AI-Powered Vedic Astrology · Rohiit Gupta, Chief Vedic Architect</p>
        <p className="mt-1">MSME · UDYAM-DL-10-0119070 · trikalvaani.com</p>
        <p className="mt-3 text-slate-600 italic max-w-lg mx-auto">
          Hast Rekha reading self-reflection ke liye hai. Samudrika Shastra ek praacheen vidya hai —
          AI isko assist karta hai. Aantim nirnay hamesha aapka.
        </p>
      </div>
    </footer>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HastRekhaClient({ faqs }: { faqs: FAQ[] }) {
  const [step,       setStep]       = useState<Step>('upload');
  const [domPalm,    setDomPalm]    = useState<PalmImage | null>(null); // dominant hand (required)
  const [otherPalm,  setOtherPalm]  = useState<PalmImage | null>(null); // non-dominant (optional)
  const [form,       setForm]       = useState<FormState>({ userName: '', mobile: '', gender: 'M', language: 'hi', handedness: 'right' });
  const [msgIdx,     setMsgIdx]     = useState(0);
  const [result,     setResult]     = useState<PalmResult | null>(null);
  const [error,      setError]      = useState('');
  const [waUrl,      setWaUrl]      = useState('');

  useEffect(() => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const handleFile = useCallback(async (file: File, slot: 'dom' | 'other') => {
    setError('');
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) { setError('JPG, PNG ya WebP chahiye'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('10MB se chhoti photo upload karein'); return; }
    try {
      const preview = URL.createObjectURL(file);
      const b64     = await compressImage(file);
      if (slot === 'dom') setDomPalm({ preview, b64 });
      else                setOtherPalm({ preview, b64 });
    } catch { setError('Image process error — dobara try karein'); }
  }, []);

  const handlePay = async () => {
    if (!domPalm) { setError('Pradhan haath (jis se aap likhte hain) ki photo zaroor upload karein'); return; }
    setStep('paying'); setError('');

    try {
      const orderRes = await fetch('/api/palmistry/order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: form.userName, gender: form.gender, language: form.language }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Order creation failed');

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         orderData.keyId,
          order_id:    orderData.orderId,
          amount:      orderData.amount,
          currency:    'INR',
          name:        'Trikaal Vaani',
          description: 'AI Hast Rekha Report — Samudrika Shastra',
          image:       '/Trikal_Logo.png',
          prefill:     { name: form.userName, contact: form.mobile },
          theme:       { color: GOLD },
          handler: async (response: any) => {
            try {
              setStep('analyzing');
              let idx = 0;
              const timer = setInterval(() => { idx = (idx + 1) % ANALYZING_MSGS.length; setMsgIdx(idx); }, 8000);

              const res = await fetch('/api/palmistry/paid-analyze', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id:   response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature:  response.razorpay_signature,
                  // v2.1 handedness contract:
                  //   right_palm_b64 = PRIMARY slot = DOMINANT hand image
                  //   left_palm_b64  = SECONDARY   = non-dominant image
                  //   `handedness` + `dominant_palm_b64` are the new explicit
                  //   fields — backend should prefer these when present.
                  right_palm_b64:      domPalm!.b64,
                  left_palm_b64:       otherPalm?.b64 ?? null,
                  dominant_palm_b64:   domPalm!.b64,
                  other_palm_b64:      otherPalm?.b64 ?? null,
                  handedness:          form.handedness,
                  user_name: form.userName, user_mobile: form.mobile, gender: form.gender, language: form.language,
                }),
              });
              clearInterval(timer);
              const data = await res.json();
              if (!res.ok || !data.success) throw new Error(data.error || 'Analysis failed');
              if (data.pending_review) {
                setWaUrl(data.whatsappUrl || '');
                setStep('review');
                resolve();
                return;
              }
              setResult(data); setStep('result'); resolve();
            } catch (e: any) { reject(e); }
          },
          modal: { ondismiss: () => { setStep('upload'); resolve(); } },
        });
        rzp.open();
      });
    } catch (err: any) {
      setError(err.message || 'Kuch galat hua — dobara try karein');
      setStep('upload');
    }
  };

  const reset = () => { setStep('upload'); setResult(null); setDomPalm(null); setOtherPalm(null); setError(''); };

  const domLabel   = form.handedness === 'right' ? 'Daya Haath — Pradhan (Dominant)'  : 'Baaya Haath — Pradhan (Dominant)';
  const otherLabel = form.handedness === 'right' ? 'Baaya Haath (Non-dominant)'        : 'Daya Haath (Non-dominant)';

  // ═══ UPLOAD ═══
  if (step === 'upload' || step === 'paying') return (
    <>
      <SiteNav />
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-4xl mx-auto">

          {/* Breadcrumb */}
          <nav className="text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/calculators" className="hover:text-slate-300">Calculators</Link>
            <span className="mx-2">›</span>
            <span style={{ color: GOLD }}>Hast Rekha</span>
          </nav>

          {/* Hero */}
          <div className="text-center mb-8">
            <p className="text-xs font-semibold tracking-[0.25em] mb-3" style={{ color: GOLD_RGBA(0.8) }}>
              SAMUDRIKA SHASTRA × AI VISION
            </p>
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 leading-tight" style={{ color: GOLD }}>
              🖐️ AI Hast Rekha Calculator
            </h1>
            <p className="text-base md:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
              Ek photo — aur Trikaal AI aapke haath ki 6 rekhaon aur 7 parvaton ka poora
              Samudrika Shastra vishleshan karti hai. PDF report aapki, hamesha ke liye.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-5">
              {['Hand Landmark Detection', 'Line Enhancement', 'AI Vision Scan', 'Samudrika Rules', 'PDF Report'].map(t => (
                <span key={t} className="px-3 py-1 rounded-full text-xs"
                  style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}`, color: GOLD_RGBA(0.9) }}>{t}</span>
              ))}
            </div>
          </div>

          {/* EEAT author chip */}
          <div className="flex items-center gap-3 mb-8 p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <img src="/Rohiit-Gupta.jpg" alt="Rohiit Gupta, Chief Vedic Architect, Trikaal Vaani"
              className="w-12 h-12 rounded-full object-cover shrink-0" style={{ border: `1px solid ${GOLD_RGBA(0.4)}` }} />
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · 16+ saal Samudrika Shastra anubhav</div>
              <div className="text-xs text-slate-500 mt-0.5">Parashara BPHS tradition · Classical Samudrika texts</div>
            </div>
          </div>

          {/* Photo tips */}
          <div className="rounded-xl p-4 mb-6" style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <p className="font-semibold text-sm mb-3" style={{ color: GOLD }}>📸 Achhi Photo = Achhi Reading</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Natural light mein lein', 'Poora haath frame mein', 'Ungliyan seedhi khuli', 'Rings/bangles utaar lein'].map((t, i) => (
                <div key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-green-400 shrink-0">✓</span><span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* v2.1 — Handedness selector (accuracy-critical) */}
          <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <p className="font-semibold text-sm mb-1" style={{ color: GOLD }}>✍️ Aap likhne ke liye kaun sa haath use karte hain?</p>
            <p className="text-xs text-slate-500 mb-3">
              Samudrika Shastra mein pradhan (dominant) haath padha jaata hai — wahi dikhata hai jo aapne banaya.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              {([['right', '🖐️ Daya (Right)'], ['left', '🤚 Baaya (Left)']] as [Handedness, string][]).map(([val, lab]) => (
                <button key={val} onClick={() => setForm(p => ({ ...p, handedness: val }))}
                  className="py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={form.handedness === val
                    ? { background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`, color: '#080B12' }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1' }}>
                  {lab}
                </button>
              ))}
            </div>
          </div>

          {/* Upload zones — dominant first, always */}
          <div className="grid md:grid-cols-2 gap-6 mb-7">
            <UploadZone image={domPalm} onFile={f => handleFile(f, 'dom')} label={domLabel}
              sublabel="Jis haath se aap likhte hain — ye zaroori hai" required emoji="🖐️" />
            <UploadZone image={otherPalm} onFile={f => handleFile(f, 'other')} label={otherLabel}
              sublabel="Dono haathon ka farak hi asli reading hai" emoji="🤚" />
          </div>

          {/* Form */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1.5">Aapka Naam</label>
              <input type="text" placeholder="Name (PDF mein aayega)"
                value={form.userName} onChange={e => setForm(p => ({ ...p, userName: e.target.value }))}
                className="w-full rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1.5">WhatsApp Number</label>
              <input type="tel" inputMode="numeric" maxLength={10} placeholder="Report link ke liye (10 digit)"
                value={form.mobile}
                onChange={e => setForm(p => ({ ...p, mobile: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) }))}
                className="w-full rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1.5">Gender</label>
              <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value as any }))}
                className="w-full rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <option value="M">Purush</option>
                <option value="F">Stri</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1.5">Language</label>
              <select value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value as any }))}
                className="w-full rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <option value="hi">हिंदी</option>
                <option value="en">English</option>
                <option value="hinglish">Hinglish</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="rounded-lg px-4 py-3 mb-4 text-red-300 text-sm"
              style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>⚠️ {error}</div>
          )}

          {/* CTA */}
          <button onClick={handlePay} disabled={!domPalm || step === 'paying'}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.01] disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`, color: '#080B12' }}>
            {step === 'paying' ? '⏳ Payment Processing...' : '🔮 Full Hast Rekha Report — ₹51'}
          </button>

          {/* What's included */}
          <div className="mt-4 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-semibold mb-2 tracking-wide" style={{ color: GOLD_RGBA(0.85) }}>REPORT MEIN KYA HAI</p>
            <div className="grid grid-cols-2 gap-1.5">
              {['8 Dimension Scores', '6 Mukhya Rekhaen Analysis', '7 Parvat Vishleshan', 'Vyaktitva Vishleshan',
                'Vyavsay + Dhan Yoga', 'Prem + Vivah Sanket', 'Swasthya + Adhyatma', 'Samudrika Upay',
                'Trikaal AI ka Sandesh', 'PDF Download ✓'].map((item, i) => (
                <div key={i} className="flex gap-2 text-xs text-slate-400">
                  <span style={{ color: GOLD }}>◈</span><span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-slate-600 text-xs mt-4">
            Secure payment via Razorpay · Photo sirf analysis ke liye — hamare database mein save nahi hoti · One-time ₹51
          </p>

          {/* AEO FAQ */}
          <section className="mt-14 pt-10 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h2 className="text-2xl font-serif font-bold mb-6 text-center" style={{ color: GOLD }}>
              Aksar Pooche Jaane Wale Sawaal
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="p-4 rounded-xl cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <summary className="font-semibold" style={{ color: GOLD }}>{faq.q}</summary>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* SEO content — Budh Rekha removed (official scope = 6 lines) */}
          <section className="mt-12">
            <h2 className="text-xl font-serif font-bold mb-4" style={{ color: GOLD }}>Haath Ki Rekhaen Kya Batati Hain?</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Jeevan Rekha (Life Line) vitality aur swasthya batati hai. Mastishk Rekha (Head Line) career path aur
              soch ka tarika dikhati hai. Hriday Rekha (Heart Line) prem aur rishton ki gehrai batati hai.
              Bhagya Rekha (Fate Line) career trajectory aur bhagya sanket deti hai. Surya Rekha yash aur samridhi
              batati hai, aur Vivah Rekha rishton ke bandhan ka sanket. Trikaal Vaani ka AI engine in sab ko
              7 parvaton ke sandarbh mein ek saath analyze karke aapko personalized Samudrika Shastra report deta hai.
            </p>
          </section>

          {/* Internal links */}
          <section className="mt-10 grid sm:grid-cols-3 gap-3">
            {[
              { href: '/calculators/free-kundali-calculator', label: 'Free Kundli Calculator', emoji: '🔮' },
              { href: '/kundali-milan', label: 'Kundali Milan', emoji: '💑' },
              { href: '/calculators', label: 'All Calculators', emoji: '🧮' },
            ].map((l) => (
              <Link key={l.href} href={l.href}
                className="p-4 rounded-xl text-center transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${GOLD_RGBA(0.15)}` }}>
                <div className="text-2xl mb-1">{l.emoji}</div>
                <div className="text-sm font-medium" style={{ color: GOLD_RGBA(0.9) }}>{l.label}</div>
              </Link>
            ))}
          </section>

        </div>
      </main>
      <HastRekhaFooter />
    </>
  );

  // ═══ ANALYZING ═══
  if (step === 'analyzing') return (
    <>
      <SiteNav />
      <main className="min-h-screen pt-20 flex flex-col items-center justify-center px-4 text-center"
        style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="text-7xl mb-8 animate-pulse">🔮</div>
        <h2 className="text-2xl font-serif font-bold mb-3" style={{ color: GOLD }}>Trikaal AI Vishleshan Kar Rahi Hai...</h2>
        <p className="max-w-sm min-h-[2rem]" style={{ color: GOLD_RGBA(0.85) }}>{ANALYZING_MSGS[msgIdx]}</p>
        <div className="flex gap-2 mt-8">
          {ANALYZING_MSGS.map((_, i) => (
            <div key={i} className="h-1.5 rounded-full transition-all duration-500"
              style={{ width: i === msgIdx ? '32px' : '8px', background: i === msgIdx ? GOLD : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
        <p className="text-slate-600 text-xs mt-8">90 second tak lag sakte hain — kripya page band na karein</p>
      </main>
    </>
  );

  // ═══ REVIEW — honest premium QC handoff (no fabricated flattery) ═══
  if (step === 'review') return (
    <>
      <SiteNav />
      <main className="min-h-screen pt-20 pb-16 px-4 flex flex-col items-center justify-center"
        style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-6">🔱</div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Aapki Report Extra Jaanch Mein Hai
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
            Hamara usool seedha hai: <strong style={{ color: GOLD }}>galat ya adhoori report kabhi nahi bhejni.</strong>{' '}
            Aapki photo ke analysis ko hum ek baar aur saavdhani se check kar rahe hain, taaki jo report
            aap tak pahunche wo poori tarah sahi ho. Aapki detailed report agle{' '}
            <strong style={{ color: GOLD }}>30 minute</strong> mein WhatsApp par bheji jayegi.
          </p>

          <div className="rounded-xl p-5 mb-6" style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <p className="text-sm text-slate-400 leading-relaxed">
              ✓ Aapka payment safe hai<br />
              ✓ Report jaanch ke baad hi aayegi<br />
              ✓ Koi extra charge nahi
            </p>
          </div>

          {waUrl && (
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-base transition-all hover:scale-[1.02] mb-3"
              style={{ background: '#25D366', color: '#fff' }}>
              <span>💬</span> WhatsApp Par Confirm Karein
            </a>
          )}

          <Link href="/"
            className="inline-block w-full py-3 rounded-xl text-slate-500 hover:text-slate-300 text-sm transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            Home Par Wapas Jayein
          </Link>

          <p className="text-slate-600 text-xs mt-6">
            Trikaal Vaani · Rohiit Gupta, Chief Vedic Architect
          </p>
        </div>
      </main>
    </>
  );

  // ═══ RESULT ═══
  if (step === 'result' && result) {
    const { scores, report, mp_features, pdf_b64 } = result;
    return (
      <>
        <SiteNav />
        <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
          <div className="max-w-3xl mx-auto">

            {/* Header */}
            <div className="text-center mb-8">
              <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: GOLD_RGBA(0.8) }}>VISHLESHAN COMPLETE ✓</p>
              <h1 className="text-3xl font-serif font-bold mb-3" style={{ color: GOLD }}>Aapki Hast Rekha Report</h1>
              {mp_features?.hand_shape && (
                <div className="flex gap-2 justify-center flex-wrap">
                  <span className="px-4 py-1.5 rounded-full text-sm"
                    style={{ background: GOLD_RGBA(0.12), border: `1px solid ${GOLD_RGBA(0.3)}`, color: GOLD }}>
                    {mp_features.hand_shape} Haath
                  </span>
                  {mp_features?.thumb_angle && (
                    <span className="px-4 py-1.5 rounded-full text-sm text-slate-400"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      Angutha: {mp_features.thumb_angle}°
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* PDF top CTA */}
            {pdf_b64 && (
              <div className="rounded-xl p-5 mb-6 flex items-center justify-between gap-4"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <div>
                  <p className="text-green-400 font-semibold mb-1">📄 PDF Report Ready!</p>
                  <p className="text-slate-400 text-sm">Aapki complete report download ke liye taiyar</p>
                </div>
                <button onClick={() => downloadPDF(pdf_b64, form.userName)}
                  className="shrink-0 px-5 py-2.5 rounded-lg font-semibold text-sm bg-green-600 hover:bg-green-500 text-white transition-all">
                  ⬇ Download PDF
                </button>
              </div>
            )}

            {/* Scores */}
            <section className="mb-6">
              <h2 className="text-base font-semibold mb-4 text-slate-300">📊 Aapke Samudrika Scores</h2>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(scores).map(([key, val]) => {
                  const meta = SCORE_META[key]; if (!meta) return null;
                  const col = scoreColor(val);
                  return (
                    <div key={key} className="rounded-xl p-4"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-slate-300">{meta.icon} {meta.label}</span>
                        <span className="text-sm font-bold ml-2" style={{ color: GOLD }}>{val}/100</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: `${val}%`, background: col }} />
                      </div>
                      <span className="text-xs" style={{ color: col }}>{scoreTag(val)}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Hast Parichay */}
            {report?.hast_parichay && (
              <section className="rounded-xl p-5 mb-5" style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
                <h2 className="font-semibold mb-3 text-sm" style={{ color: GOLD }}>🖐️ Hast Parichay</h2>
                <p className="text-slate-300 text-sm leading-relaxed">{report.hast_parichay}</p>
              </section>
            )}

            {/* Highlights */}
            <div className="grid md:grid-cols-2 gap-4 mb-5">
              {report?.top_strength && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <p className="text-green-400 text-xs font-semibold mb-2 tracking-wide">💪 SABSE BADI SHAKTI</p>
                  <p className="text-slate-200 text-sm leading-relaxed">{report.top_strength}</p>
                </div>
              )}
              {report?.top_challenge && (
                <div className="rounded-xl p-4" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)' }}>
                  <p className="text-orange-400 text-xs font-semibold mb-2 tracking-wide">🎯 DHYAN DENE WALA KSHETRA</p>
                  <p className="text-slate-200 text-sm leading-relaxed">{report.top_challenge}</p>
                </div>
              )}
            </div>

            {/* Sections */}
            {[
              { key: 'mukhya_rekhaen', title: '〰️ Mukhya Rekhaen' },
              { key: 'vyaktitva',      title: '🧠 Vyaktitva' },
              { key: 'vyavsay_dhan',   title: '💼 Vyavsay aur Dhan' },
              { key: 'prem_vivah',     title: '❤️ Prem aur Vivah' },
              { key: 'swasthya',       title: '🌿 Swasthya' },
              { key: 'adhyatma',       title: '🕉️ Adhyatma' },
            ].map(({ key, title }) =>
              report?.[key] ? (
                <section key={key} className="rounded-xl p-5 mb-5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h2 className="font-semibold text-sm mb-3 text-white">{title}</h2>
                  <p className="text-slate-300 text-sm leading-relaxed">{report[key]}</p>
                </section>
              ) : null
            )}

            {/* Vishesh */}
            {report?.vishesh_sanket && (
              <section className="rounded-xl p-5 mb-5" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}>
                <h2 className="font-semibold text-sm mb-3" style={{ color: '#c4b5fd' }}>⭐ Vishesh Sanket</h2>
                <p className="text-slate-300 text-sm leading-relaxed">{report.vishesh_sanket}</p>
              </section>
            )}

            {/* Upay */}
            {Array.isArray(report?.upay) && report.upay.length > 0 && (
              <section className="rounded-xl p-5 mb-5" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <h2 className="font-semibold text-sm mb-3" style={{ color: '#a5b4fc' }}>🕉️ Samudrika Upay</h2>
                <ul className="space-y-2">
                  {report.upay.map((u: string, i: number) => (
                    <li key={i} className="flex gap-2.5 text-sm text-slate-300">
                      <span className="shrink-0 mt-0.5" style={{ color: '#818cf8' }}>◈</span><span>{u}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* v2.1 RATNA — honest pointer, engine's shubh_ratna intentionally NOT rendered.
                Palm marks never decide a gemstone; the Kundali does. This card protects the
                anti-fear promise AND cross-sells the gemstone calculator. */}
            <section className="rounded-xl p-5 mb-5" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}>
              <h2 className="font-semibold text-sm mb-2" style={{ color: '#93c5fd' }}>💎 Ratna Ke Baare Mein Sach</h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                Ratna kabhi hatheli ke nishan se tay nahi hota — wo aapki <strong>Kundali</strong> se hota hai.
                Isliye hum is report mein koi ratna suggest nahi karte. Galat ratna nuksaan karta hai.
                Apni Kundali ke hisaab se free mein check karein:
              </p>
              <Link href="/calculators/free-gemstone-suitability-calculator"
                className="inline-block px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)', color: '#93c5fd' }}>
                💎 Free Gemstone Suitability Calculator →
              </Link>
            </section>

            {/* Trikaal AI Sandesh */}
            {report?.jini_sandesh && (
              <section className="rounded-xl p-6 mb-5 text-center"
                style={{ background: `linear-gradient(135deg, ${GOLD_RGBA(0.12)}, rgba(2,8,23,0.6))`, border: `1px solid ${GOLD_RGBA(0.35)}` }}>
                <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: GOLD }}>✨ TRIKAAL AI KA SANDESH</p>
                <p className="text-slate-200 text-sm leading-relaxed italic">{report.jini_sandesh}</p>
              </section>
            )}

            {/* PDF bottom */}
            {pdf_b64 && (
              <button onClick={() => downloadPDF(pdf_b64, form.userName)}
                className="w-full py-3.5 rounded-xl font-semibold transition-all bg-green-700 hover:bg-green-600 text-white mb-5">
                ⬇ PDF Report Download Karein
              </button>
            )}

            {/* Upsell — timing questions belong to the Kundali; honest bridge */}
            <section className="rounded-2xl p-6 text-center mb-5"
              style={{ background: `linear-gradient(135deg, ${GOLD_RGBA(0.12)}, rgba(2,8,23,0.6))`, border: `1px solid ${GOLD_RGBA(0.35)}` }}>
              <h3 className="font-serif font-bold text-lg mb-2" style={{ color: GOLD }}>Ab Sawaal &ldquo;Kab&rdquo; Ka Hai?</h3>
              <p className="text-slate-400 text-sm mb-5 max-w-sm mx-auto">
                Hatheli batati hai <em>kya</em> — timing batati hai <strong>Kundali</strong>.
                Vivah kab, career shift kab, dasha kya keh rahi hai — sab Janam Kundali se.
              </p>
              <Link href="/#birth-form"
                className="inline-block px-8 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`, color: '#080B12' }}>
                🔮 Trikaal Ka Sandesh — ₹51 →
              </Link>
            </section>

            {/* Retry */}
            <button onClick={reset}
              className="w-full py-3 rounded-xl text-slate-500 hover:text-slate-300 text-sm transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              🔄 Nayi Photo se Dobara Try Karein
            </button>

          </div>
        </main>
        <HastRekhaFooter />
      </>
    );
  }

  return null;
}
