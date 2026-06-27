'use client';

// app/hast-rekha-calculator/HastRekhaClient.tsx
// Version: 2.0.0 — Paid ₹51 + Razorpay + PDF + SEO/GEO/AEO/EEAT
// Trikaal Vaani | Rohiit Gupta, Chief Vedic Architect

import { useState, useRef, useCallback, useEffect } from 'react';

declare global {
  interface Window { Razorpay: any; }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'upload' | 'paying' | 'analyzing' | 'result';

interface FormState {
  userName: string;
  gender:   'M' | 'F';
  language: 'hi' | 'en' | 'hinglish';
  dob:      string;
}

interface PalmImage { preview: string; b64: string; }

interface PalmResult {
  success:      boolean;
  session_id:   string;
  mp_features:  Record<string, any>;
  scores:       Record<string, number>;
  observations: string[];
  report:       Record<string, any>;
  pdf_b64:      string | null;
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
  'MediaPipe से 21 बिंदु extract हो रहे हैं...',
  'OpenCV से रेखाएं sharp की जा रही हैं...',
  'Gemini Vision palm lines read कर रही है...',
  'Samudrika Shastra नियम लागू हो रहे हैं...',
  'Trikaal आपकी रिपोर्ट तैयार कर रही है...',
];

const GEO_ANSWER = `Samudrika Shastra mein haath ki 6 mukhya rekhaen — Jeevan, Mastishk, Hriday, Bhagya, Surya aur Budh — aur 8 parvat (Jupiter se Chandra tak) vyakti ke career, swasthya, prem aur adhyatma ka maarg dikhate hain. Trikaal Vaani ka AI engine MediaPipe + Gemini Vision se in sab ko scan karta hai.`;

// ─── Utilities ────────────────────────────────────────────────────────────────

async function compressImage(file: File, maxPx = 1200): Promise<string> {
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
        resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1]);
      } catch (e) { reject(e); }
      finally { URL.revokeObjectURL(url); }
    };
    img.onerror = reject;
    img.src = url;
  });
}

function scoreColor(v: number) {
  if (v >= 75) return 'bg-green-500';
  if (v >= 55) return 'bg-amber-500';
  return 'bg-orange-500';
}

function scoreTag(v: number): { label: string; color: string } {
  if (v >= 80) return { label: 'उत्तम',  color: 'text-green-400' };
  if (v >= 65) return { label: 'शुभ',    color: 'text-amber-400' };
  if (v >= 50) return { label: 'मध्यम',  color: 'text-yellow-400' };
  return            { label: 'सुधार',  color: 'text-orange-400' };
}

function downloadPDF(b64: string, name: string) {
  const bytes  = atob(b64);
  const arr    = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  const blob   = new Blob([arr], { type: 'application/pdf' });
  const link   = document.createElement('a');
  link.href    = URL.createObjectURL(blob);
  link.download = `trikaal-vaani-hast-rekha-${name || 'report'}.pdf`;
  link.click();
}

// ─── Upload Zone ─────────────────────────────────────────────────────────────

function UploadZone({
  image, onFile, label, required, emoji,
}: {
  image: PalmImage | null;
  onFile: (f: File) => void;
  label: string;
  required?: boolean;
  emoji: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
        {!required && <span className="text-gray-600 ml-1 text-xs">(Optional — better results)</span>}
      </label>
      <div
        onClick={() => ref.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all min-h-[190px] flex flex-col items-center justify-center
          ${image ? 'border-green-600 bg-green-950/20' : required
            ? 'border-amber-700/60 bg-amber-950/10 hover:border-amber-500'
            : 'border-gray-700 bg-gray-900/20 hover:border-gray-500'}`}
      >
        {image ? (
          <>
            <img src={image.preview} alt={label} className="max-h-40 rounded-lg object-cover" />
            <p className="text-green-400 text-sm mt-2">✓ Upload successful</p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-3">{emoji}</div>
            <p className="text-gray-400 text-sm">Click karein ya photo drag karein</p>
            <p className="text-gray-600 text-xs mt-1">JPG, PNG, WebP · Max 10MB</p>
          </>
        )}
        <input ref={ref} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={e => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HastRekhaClient() {
  const [step,       setStep]       = useState<Step>('upload');
  const [rightPalm,  setRightPalm]  = useState<PalmImage | null>(null);
  const [leftPalm,   setLeftPalm]   = useState<PalmImage | null>(null);
  const [form,       setForm]       = useState<FormState>({ userName: '', gender: 'M', language: 'hi', dob: '' });
  const [msgIdx,     setMsgIdx]     = useState(0);
  const [result,     setResult]     = useState<PalmResult | null>(null);
  const [error,      setError]      = useState('');

  // Load Razorpay script
  useEffect(() => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const handleFile = useCallback(async (file: File, side: 'right' | 'left') => {
    setError('');
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      setError('JPG, PNG ya WebP chahiye'); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('10MB se chhoti photo upload karein'); return;
    }
    try {
      const preview = URL.createObjectURL(file);
      const b64     = await compressImage(file);
      if (side === 'right') setRightPalm({ preview, b64 });
      else                  setLeftPalm({ preview, b64 });
    } catch { setError('Image process error — dobara try karein'); }
  }, []);

  // ── Payment + Analysis ────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!rightPalm) { setError('Seedha haath (Right Palm) zaroor upload karein'); return; }

    setStep('paying');
    setError('');

    try {
      // 1. Create Razorpay order
      const orderRes = await fetch('/api/palmistry/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: form.userName, gender: form.gender, language: form.language }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Order creation failed');

      // 2. Open Razorpay
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          order_id:    orderData.order_id,
          amount:      orderData.amount,
          currency:    'INR',
          name:        'Trikaal Vaani',
          description: 'AI Hast Rekha Report — Samudrika Shastra',
          image:       '/logo.png',
          prefill: {
            name: form.userName,
          },
          theme: { color: '#d97706' },
          handler: async (response: any) => {
            try {
              // 3. Verify + Analyze + PDF
              setStep('analyzing');
              let idx = 0;
              const timer = setInterval(() => {
                idx = (idx + 1) % ANALYZING_MSGS.length;
                setMsgIdx(idx);
              }, 3000);

              const res = await fetch('/api/palmistry/paid-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id:   response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature:  response.razorpay_signature,
                  right_palm_b64:      rightPalm!.b64,
                  left_palm_b64:       leftPalm?.b64 ?? null,
                  user_name:           form.userName,
                  gender:              form.gender,
                  language:            form.language,
                  dob:                 form.dob,
                }),
              });

              clearInterval(timer);
              const data = await res.json();
              if (!res.ok || !data.success) throw new Error(data.error || 'Analysis failed');

              setResult(data);
              setStep('result');
              resolve();
            } catch (e: any) {
              reject(e);
            }
          },
          modal: {
            ondismiss: () => {
              setStep('upload');
              resolve();
            },
          },
        });
        rzp.open();
      });

    } catch (err: any) {
      setError(err.message || 'Kuch galat hua — dobara try karein');
      setStep('upload');
    }
  };

  const reset = () => {
    setStep('upload'); setResult(null);
    setRightPalm(null); setLeftPalm(null); setError('');
  };

  // ── UPLOAD ────────────────────────────────────────────────────────────────
  if (step === 'upload' || step === 'paying') return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">

      {/* GEO Answer Block — for AI search engines */}
      <div className="sr-only" aria-label="Direct Answer">
        <p>{GEO_ANSWER}</p>
      </div>

      {/* Hero */}
      <section className="py-14 px-4 text-center bg-gradient-to-b from-amber-950/25 to-transparent">
        <p className="text-amber-400 text-xs font-semibold tracking-[0.25em] mb-3">
          SAMUDRIKA SHASTRA × MEDIAPIPE × GEMINI VISION × CLAUDE AI
        </p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
          🖐️ AI Hast Rekha Calculator
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto text-base leading-relaxed">
          Photo upload karein — Trikaal AI aapki Hast Rekhaon ka complete Samudrika Shastra vishleshan karti hai.
          PDF report milti hai — ek baar ke liye, seved rakhne layak.
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-2 justify-center mt-5">
          {['MediaPipe Analysis', 'OpenCV Enhancement', 'Gemini Vision', 'Samudrika Rules', 'PDF Report'].map(t => (
            <span key={t} className="px-3 py-1 bg-amber-900/30 border border-amber-700/30 rounded-full text-amber-300 text-xs">{t}</span>
          ))}
        </div>
      </section>

      {/* EEAT — Author Signal */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 bg-gray-900/40 border border-gray-800 rounded-xl px-4 py-3 mb-6 text-sm text-gray-400">
          <span className="text-lg">🕉️</span>
          <span>
            <strong className="text-gray-300">Rohiit Gupta</strong>, Chief Vedic Architect — 16+ saal ka Samudrika Shastra anubhav.
            Parashara BPHS tradition mein trained. Lahiri Ayanamsa + classical texts ke aadhar par AI engine.
          </span>
        </div>

        {/* Photo Tips */}
        <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-4 mb-6">
          <p className="text-amber-400 font-semibold text-sm mb-3">📸 Achhi Photo Ke Liye</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Natural light mein lein', 'Poora haath frame mein', 'Ungliyan seedhi khuli', 'Rings/bangles utaar lein'].map((t, i) => (
              <div key={i} className="flex gap-2 text-sm text-gray-300">
                <span className="text-green-400 shrink-0">✓</span><span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upload */}
        <div className="grid md:grid-cols-2 gap-6 mb-7">
          <UploadZone image={rightPalm} onFile={f => handleFile(f, 'right')} label="Seedha Haath (Right Palm)" required emoji="🖐️" />
          <UploadZone image={leftPalm}  onFile={f => handleFile(f, 'left')}  label="Ulta Haath (Left Palm)"   emoji="🤚" />
        </div>

        {/* Form */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1.5">Aapka Naam</label>
            <input type="text" placeholder="Name (PDF mein aayega)"
              value={form.userName}
              onChange={e => setForm(p => ({ ...p, userName: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Gender</label>
            <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value as any }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500">
              <option value="M">Purush</option>
              <option value="F">Stri</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Report Language</label>
            <select value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value as any }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500">
              <option value="hi">हिंदी</option>
              <option value="en">English</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-800/40 rounded-lg px-4 py-3 mb-4 text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* CTA */}
        <button onClick={handlePay}
          disabled={!rightPalm || step === 'paying'}
          className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition-all shadow-lg shadow-amber-900/30">
          {step === 'paying' ? '⏳ Payment Processing...' : '🔮 Full Hast Rekha Report — ₹51'}
        </button>

        {/* What's included */}
        <div className="mt-4 bg-gray-900/40 border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs font-semibold mb-2 tracking-wide">REPORT MEIN KIYA HAI</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              '8 Dimension Scores', 'Mukhya Rekhaen Analysis', 'Vyaktitva Vishleshan',
              'Vyavsay + Dhan Yoga', 'Prem + Vivah Sanket', 'Swasthya + Adhyatma',
              'Samudrika Upay (4)', 'Shubh Ratna Suggestion',
              'Trikaal ka Vyaktigat Sandesh', 'PDF Download ✓'
            ].map((item, i) => (
              <div key={i} className="flex gap-2 text-xs text-gray-400">
                <span className="text-amber-500">◈</span><span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          Secure payment via Razorpay · SSL encrypted · One-time ₹51
        </p>
      </div>

      {/* AEO FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 py-14 border-t border-gray-900 mt-12">
        <h2 className="text-xl font-semibold mb-8 text-amber-400 text-center">
          Aksar Pooche Jaane Wale Sawaal
        </h2>
        {[
          {
            q: 'Samudrika Shastra kya hota hai?',
            a: 'Samudrika Shastra bharat ki prachin vidya hai jisme haath ki rekhaon, parvaton, unglion aur haath ke aakar se vyakti ke jeevan ka vishleshan hota hai. Iska ullekh Brihat Samhita aur Hasta Sanjivani jaise shastriya granthon mein milta hai.'
          },
          {
            q: 'AI palmistry kitni accurate hai?',
            a: 'Achhi lighting aur clear palm photo ke saath MediaPipe 90%+ accuracy se 21 hand landmarks detect karta hai. Gemini Vision 6 mukhya rekhaon aur 8 parvaton ko scan karta hai. premium AI engine Samudrika niyamon se final report banata hai. Yeh ek AI-assisted reading hai — ek starting point, final nirnay hamesha aapka.'
          },
          {
            q: 'Kaun sa haath upload karein — seedha ya ulta?',
            a: 'Seedha haath (right hand) — jo aap daily kaam mein use karte hain — aapka active/future haath hai. Ulta haath passive/past haath hai. Right palm required hai, left palm optional hai lekin dono se better analysis milti hai.'
          },
          {
            q: 'Hast Rekha Report mein kya milega?',
            a: '8 dimension scores (career, wealth, health, relationships, vitality, leadership, creativity, spirituality), 7 detailed sections in Hindi/English/Hinglish, 4 Samudrika upay, shubh ratna suggestion, Trikaal ka personal sandesh, aur ek downloadable PDF report.'
          },
          {
            q: 'Kya meri palm image save hoti hai?',
            a: 'Nahi. Palm images hamare server par kabhi store nahi hoti. Report data Supabase mein save hota hai lekin images strictly browser session mein rehti hain aur analysis ke baad delete ho jaati hain.'
          },
          {
            q: 'Refund policy kya hai?',
            a: 'Agar technical error ki wajah se report generate nahi hui toh 100% refund diya jaata hai. Successfully generated report ke liye refund nahi hota kyunki digital delivery immediately hoti hai.'
          },
        ].map(({ q, a }, i) => (
          <details key={i} className="border-b border-gray-800 py-4 group">
            <summary className="cursor-pointer text-sm font-medium text-gray-200 hover:text-amber-400 transition-colors list-none flex justify-between">
              {q}
              <span className="text-amber-500 group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed">{a}</p>
          </details>
        ))}
      </section>

      {/* SEO Content */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-semibold mb-4 text-amber-400">Haath Ki Rekhaen Kya Batati Hain?</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          Jeevan Rekha (Life Line) vitality aur swasthya batati hai. Mastishk Rekha (Head Line) career path aur
          soch ka tarika dikhati hai. Hriday Rekha (Heart Line) prem aur rishton ki deepth batati hai.
          Bhagya Rekha (Fate Line) career trajectory aur bhagya sanket deti hai. Surya Rekha yash aur samridhi,
          Budh Rekha vyapar aur communication skills batati hai. Trikaal Vaani ka AI engine in sab ko ek saath
          analyze karke aapko personalized Samudrika Shastra report deta hai.
        </p>
        <p className="text-xs text-gray-600 italic">
          Disclaimer: Yeh report entertainment aur self-reflection ke liye hai. Koi bhi mahatvapoorn nirnay
          keval is report ke aadhar par na lein. Samudrika Shastra ek praacheen vidya hai — AI isko assist
          karta hai, replace nahi karta.
        </p>
      </section>
    </main>
  );

  // ── ANALYZING ─────────────────────────────────────────────────────────────
  if (step === 'analyzing') return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-4 text-center">
      <div className="text-7xl mb-8 animate-pulse">🔮</div>
      <h2 className="text-2xl font-bold mb-3">Trikaal Vishleshan Kar Rahi Hai...</h2>
      <p className="text-amber-400 max-w-sm min-h-[2rem]">{ANALYZING_MSGS[msgIdx]}</p>
      <div className="flex gap-2 mt-8">
        {ANALYZING_MSGS.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === msgIdx ? 'w-8 bg-amber-400' : 'w-2 bg-gray-800'}`} />
        ))}
      </div>
      <p className="text-gray-600 text-xs mt-8">20-45 seconds lag sakte hain — page band mat karein</p>
    </main>
  );

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (step === 'result' && result) {
    const { scores, report, mp_features, observations, pdf_b64 } = result;
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white pb-24">

        {/* Header */}
        <section className="py-12 px-4 text-center bg-gradient-to-b from-amber-950/25 to-transparent">
          <p className="text-amber-400 text-xs font-semibold tracking-widest mb-3">JINI KA VISHLESHAN COMPLETE ✓</p>
          <h1 className="text-3xl font-bold mb-3">Aapki Hast Rekha Report</h1>
          {mp_features?.hand_shape && (
            <div className="flex gap-2 justify-center flex-wrap">
              <span className="px-4 py-1.5 bg-amber-900/40 border border-amber-700/40 rounded-full text-amber-300 text-sm">
                {mp_features.hand_shape} Haath
              </span>
              {mp_features?.thumb_angle && (
                <span className="px-4 py-1.5 bg-gray-900 border border-gray-700 rounded-full text-gray-400 text-sm">
                  Angutha: {mp_features.thumb_angle}°
                </span>
              )}
            </div>
          )}
        </section>

        <div className="max-w-3xl mx-auto px-4 space-y-5">

          {/* PDF Download CTA — prominent at top */}
          {pdf_b64 && (
            <div className="bg-gradient-to-r from-green-950/40 to-emerald-950/40 border border-green-700/40 rounded-xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-green-400 font-semibold mb-1">📄 PDF Report Ready!</p>
                <p className="text-gray-400 text-sm">Aapki complete Hast Rekha report download ke liye taiyar hai</p>
              </div>
              <button
                onClick={() => downloadPDF(pdf_b64, form.userName)}
                className="shrink-0 px-5 py-2.5 bg-green-600 hover:bg-green-500 rounded-lg font-semibold text-sm transition-all">
                ⬇ Download PDF
              </button>
            </div>
          )}

          {/* Scores */}
          <section>
            <h2 className="text-base font-semibold mb-4 text-gray-300">📊 Aapke Samudrika Scores</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(scores).map(([key, val]) => {
                const meta = SCORE_META[key]; if (!meta) return null;
                const tag  = scoreTag(val);
                return (
                  <div key={key} className="bg-gray-900/70 border border-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-300">{meta.icon} {meta.label}</span>
                      <span className="text-sm font-bold text-amber-400 ml-2">{val}/100</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-1.5">
                      <div className={`h-full rounded-full ${scoreColor(val)}`} style={{ width: `${val}%` }} />
                    </div>
                    <span className={`text-xs ${tag.color}`}>{tag.label}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Hast Parichay */}
          {report?.hast_parichay && (
            <section className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-5">
              <h2 className="text-amber-400 font-semibold mb-3 text-sm">🖐️ Hast Parichay</h2>
              <p className="text-gray-300 text-sm leading-relaxed">{report.hast_parichay}</p>
            </section>
          )}

          {/* Highlights */}
          <div className="grid md:grid-cols-2 gap-4">
            {report?.top_strength && (
              <div className="bg-green-950/20 border border-green-800/30 rounded-xl p-4">
                <p className="text-green-400 text-xs font-semibold mb-2 tracking-wide">💪 SABSE BADI SHAKTI</p>
                <p className="text-gray-200 text-sm leading-relaxed">{report.top_strength}</p>
              </div>
            )}
            {report?.top_challenge && (
              <div className="bg-orange-950/20 border border-orange-800/30 rounded-xl p-4">
                <p className="text-orange-400 text-xs font-semibold mb-2 tracking-wide">🎯 DHYAN DENE WALA KSHETRA</p>
                <p className="text-gray-200 text-sm leading-relaxed">{report.top_challenge}</p>
              </div>
            )}
          </div>

          {/* All Report Sections */}
          {[
            { key: 'mukhya_rekhaen', title: '〰️ Mukhya Rekhaen' },
            { key: 'vyaktitva',      title: '🧠 Vyaktitva' },
            { key: 'vyavsay_dhan',   title: '💼 Vyavsay aur Dhan' },
            { key: 'prem_vivah',     title: '❤️ Prem aur Vivah' },
            { key: 'swasthya',       title: '🌿 Swasthya' },
            { key: 'adhyatma',       title: '🕉️ Adhyatma' },
          ].map(({ key, title }) =>
            report?.[key] ? (
              <section key={key} className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-5">
                <h2 className="font-semibold text-sm mb-3 text-white">{title}</h2>
                <p className="text-gray-300 text-sm leading-relaxed">{report[key]}</p>
              </section>
            ) : null
          )}

          {/* Vishesh Sanket */}
          {report?.vishesh_sanket && (
            <section className="bg-purple-950/20 border border-purple-800/30 rounded-xl p-5">
              <h2 className="text-purple-300 font-semibold text-sm mb-3">⭐ Vishesh Sanket</h2>
              <p className="text-gray-300 text-sm leading-relaxed">{report.vishesh_sanket}</p>
            </section>
          )}

          {/* Upay */}
          {Array.isArray(report?.upay) && report.upay.length > 0 && (
            <section className="bg-indigo-950/20 border border-indigo-800/30 rounded-xl p-5">
              <h2 className="text-indigo-300 font-semibold text-sm mb-3">🕉️ Samudrika Upay</h2>
              <ul className="space-y-2">
                {report.upay.map((u: string, i: number) => (
                  <li key={i} className="flex gap-2.5 text-sm text-gray-300">
                    <span className="text-indigo-400 shrink-0 mt-0.5">◈</span><span>{u}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Ratna */}
          {report?.shubh_ratna && (
            <section className="bg-blue-950/20 border border-blue-800/30 rounded-xl p-5">
              <h2 className="text-blue-300 font-semibold text-sm mb-2">💎 Shubh Ratna</h2>
              <p className="text-gray-300 text-sm">{report.shubh_ratna}</p>
            </section>
          )}

          {/* Jini */}
          {report?.jini_sandesh && (
            <section className="bg-gradient-to-r from-amber-950/30 to-orange-950/30 border border-amber-700/40 rounded-xl p-6 text-center">
              <p className="text-amber-400 text-xs font-semibold tracking-widest mb-3">✨ JINI KA SANDESH</p>
              <p className="text-gray-200 text-sm leading-relaxed italic">{report.jini_sandesh}</p>
            </section>
          )}

          {/* PDF at bottom too */}
          {pdf_b64 && (
            <button onClick={() => downloadPDF(pdf_b64, form.userName)}
              className="w-full py-3.5 bg-green-700 hover:bg-green-600 rounded-xl font-semibold transition-all">
              ⬇ PDF Report Download Karein
            </button>
          )}

          {/* Upsell */}
          <section className="bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-700/30 rounded-xl p-6 text-center">
            <h3 className="font-bold text-lg mb-2">Gehri Kundali Reading Chahiye?</h3>
            <p className="text-gray-400 text-sm mb-5 max-w-sm mx-auto">
              Janam Kundali se career, vivah timing, dhan yoga aur upcoming dasha
            </p>
            <a href="/kundali"
              className="inline-block px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-lg font-semibold text-sm transition-all">
              Kundali Deep Reading — ₹51 →
            </a>
          </section>

          <button onClick={reset}
            className="w-full py-3 border border-gray-800 hover:border-gray-600 rounded-xl text-gray-500 hover:text-gray-300 text-sm transition-all">
            🔄 Nayi Photo se Dobara Try Karein
          </button>
        </div>
      </main>
    );
  }

  return null;
}
