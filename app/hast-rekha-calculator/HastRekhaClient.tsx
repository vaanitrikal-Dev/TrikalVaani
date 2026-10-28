'use client';

// ============================================================
// File: app/hast-rekha-calculator/HastRekhaClient.tsx
// Version: 3.4 (28 Oct 2026 — RESULT DIKHAO, BAHANA NAHI + 45s ANALYSIS) | 3.3 (28 Oct 2026 — JEEVAN KE SAWAAL + SHAADI KAB + SAAF PHOTO) | 3.2 (27 Oct 2026 — SHUBH VARSH JANM TITHI) | 3.1 (27 Oct 2026 — RETRY LINK) | 3.0 (27 Oct 2026 — HAST REKHA v3: GRANTH-AADHARIT, BINA AI) | v2.6 (11 Oct 2026 — GOOGLE PLAY BILLING) | v2.4 (29 Aug 2026 — INTERNATIONAL PAYMENT)
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
//
// CHANGE v3.4 (28 Oct 2026) — Rohiit: "Sirf result dikhao, question mat pucho, photo ka bahana
//   mat do; jaisi bhi photo mile report banado; instant result se lagta hai jaancha nahi"
//   1. Photo sirf tab roki jaati hai jab haath hi na mile. Dhundhli / galat-haath / frame wali
//      rok aur "dobara lena behtar" sandesh hataye (VM engine 2.4 sab padhta hai).
//   2. Result screen se peeli "rekha saaf nahi" patti, "muft nayi photo" button aur hari "photo
//      saaf thi" patti hatayi. needs_photo (haath hi nahi mila) wala raasta wahi.
//   3. ANALYSIS SCREEN: kam se kam 45 second, 8 asli kadam ek-ek karke tick hote hain (engine yahi
//      sab karta hai). Jawab jaldi aaye to bhi 45s poore hote hain; der ho to aakhri kadam par rukta hai.
//   4. "Muft dobara-photo" aur "Khud giniye" wale vaade upload page se hataye.
//
// CHANGE v3.3 (28 Oct 2026) — Rohiit: "Sab add karo — padhai, kitni shaadi, kitne bachche;
//   vivah-samay ₹51 mein; existing content/H2 mat hatao; ek hi deploy"
//   1. Form: janm samay + janm sthaan (CityInput, marzi par) → paid-analyze v4.7 Kundali se
//      "शादी कब होगी" report mein jodta hai. Janm tithi ke bina yeh nahi chalta — label mein likha.
//   2. Photo jaanch: VM (engine 2.3) ki haath_disha galat haath bataye, ya photo dhundhli ho →
//      photo ROKI jaati hai (lal). Do baar ke baad sirf chetavni (pehchaan galat bhi ho sakti hai).
//   3. Hero / "REPORT MEIN KYA HAI" / analyzing sandesh mein naye sawaal (purane items rakhe).
//   4. Footer se Acharya ka naam hataya (Rohiit: "remove Meghavijay name everywhere").
//
// CHANGE v3.2 (27 Oct 2026) — VM engine 2.1.0 ab janm tithi se "आने वाले शुभ वर्ष" (granth
//   1.8.11–16) deta hai. Form ka label sach kiya; muft dobara-photo screen par janm tithi
//   ka khaana (sirf jab pehle khaali chhodi thi) → /api/palmistry/retry use row mein save
//   karta hai. Rohiit approve, 27 Oct 2026.
//
// CHANGE v3.1 (27 Oct 2026) — ?retry=<slug>&t=<token> link (cron v1.8 alert mein CEO ko
//   milta hai, customer ko WhatsApp par bhejna hai). Link khulte hi seedha nayi-photo
//   screen. Token ki jaanch /api/palmistry/retry server par hi karta hai.
//
// CHANGE v3.0 (27 Oct 2026) — Rohiit approved mockup (canvas "Hast Rekha v3")
//   1. KYC-JAISA CAMERA (components/hastrekha/GuidedPalmCamera.tsx): "Right/Left
//      haath dikhaiye", sunehri hatheli aakriti, live ROSHNI + STHIR chip, sab hara
//      → 3-2-1 photo apne aap. Phone par koi naya app/AI download NAHI (Option B).
//      Photo ke baad /api/palmistry/validate (hamara VM, 1-2s) saaf wajah batata hai.
//   2. Photo dabbe ab "Right haath / Left haath" (granth 3.1.6: purush = right,
//      stri = left mukhya). Handedness selector hataya — engine right/left khud
//      pehchanta hai (website right → dominant field, warna left).
//   3. Form: janm tithi (marzi par) + photo consent checkbox (pehle se KHAALI).
//      Privacy line ab sach: "save nahi hoti — jab tak aap haan na chunein".
//   4. RESULT SCREEN v3 (components/hastrekha/GranthReport.tsx): saar dabba +
//      band dabbe + upay card. SCORES, hand-shape, "AI sandesh" HATAYE.
//      PDF + WhatsApp button upar.
//   5. MUFT DOBARA-PHOTO: report mein koi rekha kam padhi gayi → peeli patti +
//      button → nayi photo → /api/palmistry/retry (ek baar, muft). Pehli photo hi
//      na padhi jaaye (needs_photo) → turant nayi photo screen, review nahi.
//   6. "AI" wale daave hataye (hero, analyzing messages, Razorpay description).
//   Razorpay / PayPal / Google Play ke verify raaste — badle nahi. Razorpay handler
//   ab runAnalysis() hi bulata hai (pehle wahi code dohraya hua tha).
//
// (Pichhla itihaas v2.1–v2.6: handedness, 413 compression budget, PayPal, Play
//  billing — sab Git history mein. Compression budget aur 413 handling yahin hai.)
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import PayPalCheckout from '@/components/payment/PayPalCheckout';
import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import { usePlayApp } from '@/components/payment/usePlayApp';                        // v2.6
import { isPlayBillingAvailable, purchaseWithPlay, PLAY_PRODUCTS } from '@/lib/play-billing'; // v2.6
import GuidedPalmCamera, { type CapturedPhoto } from '@/components/hastrekha/GuidedPalmCamera';   // v3.0
import { GranthReportView, type GranthReportData } from '@/components/hastrekha/GranthReport';   // v3.0
import CityInput from '@/components/calculators/CityInput';                                     // v3.3

declare global {
  interface Window { Razorpay: any; }
}

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'upload' | 'paying' | 'analyzing' | 'result' | 'review' | 'retry';
type Hand = 'right' | 'left';
type Check = 'checking' | 'ok' | 'warn' | 'bad';

interface FAQ { q: string; a: string; }
interface FormState {
  userName: string;
  mobile: string;
  gender: 'M' | 'F';
  language: 'hi' | 'en' | 'hinglish';
  dob: string;
  consent: boolean;
  tob: string;                 // v3.3 'HH:MM'
  place: string;               // v3.3
  lat: number | null;
  lon: number | null;
  tz: number | null;
}
interface PalmImage { preview: string; b64: string; check: Check; message: string; }
interface PalmResult {
  success: boolean;
  slug?: string;
  mp_features: Record<string, any>;
  scores?: Record<string, number>;
  report: Record<string, any>;
  pdf_b64: string | null;
  pdf_url?: string | null;
  quality_notes?: string[];
  low_clarity?: boolean;
  retry_token?: string | null;
  free_retry_available?: boolean;
}
interface RetryCtx { slug: string; token: string; mode: 'needs_photo' | 'retry'; messages: string[]; }

// ─── Constants ────────────────────────────────────────────────────────────────

// v3.4 — analysis ke 8 kadam (engine yahi sab karta hai); kul kam se kam 45 second
const ANALYSIS_STEPS = [
  'हथेली के 21 बिंदु पहचाने',
  'पितृ, मातृ, आयु और ऊर्ध्व रेखा नापी',
  'उँगलियों के 15 पर्व जाँचे — आपके शुभ वर्ष',
  'घर, विवाह और संतान की रेखाएँ देखीं',
  'हस्तसंजीवनम् के श्लोक मिलाए',
  'जन्म-कुंडली से विवाह का समय',
  'आपका सहायक ग्रह और BPHS के उपाय',
  'आपकी PDF रिपोर्ट तैयार',
];
const MIN_ANALYSIS_MS = 45000;
const BLOCKING = ['haath_nahi_mila', 'ungli_ya_kalai_frame_se_bahar', 'haath_bahut_door'];
const RETRY_LS_KEY = 'tv_hast_retry_v1';
const HAND_HI: Record<Hand, string> = { right: 'Right', left: 'Left' };

// ─── Utilities ────────────────────────────────────────────────────────────────

// v2.2: BUDGETED compression (Vercel body limit 4.5MB, do photo). Per image <= 1.7M b64 chars.
const B64_BUDGET = 1_700_000;
const COMPRESS_STEPS: Array<[number, number]> = [
  [1600, 0.85], [1400, 0.80], [1200, 0.78], [1000, 0.72], [900, 0.70],
];

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload  = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

function drawToB64(img: HTMLImageElement, maxPx: number, quality: number): string {
  const ratio   = Math.min(1, maxPx / img.width, maxPx / img.height);
  const canvas  = document.createElement('canvas');
  canvas.width  = Math.round(img.width  * ratio);
  canvas.height = Math.round(img.height * ratio);
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality).split(',')[1] ?? '';
}

async function compressImage(file: File): Promise<string> {
  const img = await loadImage(file);
  let b64 = '';
  for (const [maxPx, q] of COMPRESS_STEPS) {
    b64 = drawToB64(img, maxPx, q);
    if (b64 && b64.length <= B64_BUDGET) return b64;
  }
  if (!b64) throw new Error('Image process nahi ho payi');
  return b64;
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

/** Website right/left → VM fields (lib/palm-store.ts toVmPhotos jaisa). */
function toVmPhotos(right: PalmImage | null, left: PalmImage | null) {
  if (right) return { dominant_palm_b64: right.b64, other_palm_b64: left?.b64 ?? null, handedness: 'right' };
  return { dominant_palm_b64: left?.b64 ?? null, other_palm_b64: null, handedness: 'left' };
}

function lsGet(): RetryCtx | null {
  try { const v = window.localStorage.getItem(RETRY_LS_KEY); return v ? JSON.parse(v) : null; } catch { return null; }
}
function lsSet(v: RetryCtx | null) {
  try { if (v) window.localStorage.setItem(RETRY_LS_KEY, JSON.stringify(v)); else window.localStorage.removeItem(RETRY_LS_KEY); } catch { /* private mode */ }
}

// ─── Photo slot ───────────────────────────────────────────────────────────────

function PhotoSlot({ hand, image, mukhya, onOpen }: {
  hand: Hand; image: PalmImage | null; mukhya: boolean; onOpen: () => void;
}) {
  const border = image
    ? image.check === 'bad' ? '#EF4444' : image.check === 'warn' ? '#F59E0B' : image.check === 'checking' ? GOLD_RGBA(0.6) : '#22C55E'
    : mukhya ? GOLD_RGBA(0.6) : 'rgba(255,255,255,0.25)';
  return (
    <button type="button" onClick={onOpen}
      className="rounded-2xl min-h-[170px] p-3 flex flex-col items-center justify-center gap-1.5 text-center transition-all"
      style={{ border: `1.5px dashed ${border}`, background: mukhya ? GOLD_RGBA(0.06) : 'rgba(255,255,255,0.03)', color: '#E5E7EB' }}>
      {image ? (
        <>
          <img src={image.preview} alt={`${HAND_HI[hand]} हाथ की फोटो`} className="max-h-24 rounded-lg object-cover" />
          <span className="text-xs leading-snug" style={{
            color: image.check === 'bad' ? '#FCA5A5' : image.check === 'warn' ? '#FCD34D' : image.check === 'checking' ? GOLD : '#86EFAC',
          }}>
            {image.check === 'checking' ? 'जाँच हो रही है…' : image.message}
          </span>
          <span className="text-[11px] text-slate-400 underline">दोबारा लें</span>
        </>
      ) : (
        <>
          <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={mukhya ? GOLD : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
          <span className="text-[15px] font-bold">{HAND_HI[hand]} हाथ</span>
          <span className="text-[11px]" style={{ color: mukhya ? '#C9A635' : '#9CA3AF' }}>
            {mukhya ? 'आपके लिए मुख्य (ग्रंथ ३.१.६)' : 'दूसरा हाथ — भेजें तो बेहतर'}
          </span>
        </>
      )}
    </button>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function HastRekhaFooter() {
  return (
    <footer className="border-t mt-8" style={{ borderColor: GOLD_RGBA(0.1) }}>
      <div className="max-w-4xl mx-auto px-5 py-8 text-center text-xs text-slate-500">
        <p style={{ color: GOLD, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Trikaal Vaani</p>
        <p className="mt-2 text-[#D4AF37] font-semibold">Granth ka Gyaan · Rohiit ki Parakh · AI ki Shakti</p>
        <p className="mt-1">Rooted in Granth · Verified by Rohiit · Powered by AI · Rohiit Gupta, Chief Vedic Architect</p>
        <p className="mt-1">MSME · UDYAM-DL-10-0119070 · trikalvaani.com</p>
        <p className="mt-3 text-slate-600 italic max-w-lg mx-auto">
          Hast Rekha report granth Hastasanjeevanam ke niyamon par aadharit hai —
          margdarshan ke liye. Aantim nirnay hamesha aapka.
        </p>
      </div>
    </footer>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HastRekhaClient({ faqs }: { faqs: FAQ[] }) {
  const [step,       setStep]       = useState<Step>('upload');
  const [rightPalm,  setRightPalm]  = useState<PalmImage | null>(null);
  const [leftPalm,   setLeftPalm]   = useState<PalmImage | null>(null);
  const [camHand,    setCamHand]    = useState<Hand | null>(null);
  const [form,       setForm]       = useState<FormState>({ userName: '', mobile: '', gender: 'M', language: 'hi', dob: '', consent: false, tob: '', place: '', lat: null, lon: null, tz: null });
  const [msgIdx,     setMsgIdx]     = useState(0);
  const [result,     setResult]     = useState<PalmResult | null>(null);
  const [error,      setError]      = useState('');
  const [waUrl,      setWaUrl]      = useState('');
  const [retry,      setRetry]      = useState<RetryCtx | null>(null);
  const [pendingLs,  setPendingLs]  = useState<RetryCtx | null>(null);
  const [retryBusy,  setRetryBusy]  = useState(false);
  const [askDob,     setAskDob]     = useState(false);   // v3.2 retry screen par janm tithi
  const [askBirth,   setAskBirth]   = useState(false);   // v3.3 retry screen par janm samay/sthaan
  const tries = useRef<Record<Hand, number>>({ right: 0, left: 0 });   // v3.3 galat-haath/dhundhli rok

  const mukhya: Hand = form.gender === 'F' ? 'left' : 'right';

  // v2.4 — international (PayPal $7). `?intl=1` forces the PayPal view.
  const [isIndia,    setIsIndia]    = useState<boolean | null>(null);
  const inPlayApp = usePlayApp();
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

  useEffect(() => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    document.body.appendChild(s);
  }, []);

  // v3.0 — pichhli report ki nayi photo baaki? (needs_photo)
  useEffect(() => {
    // v3.1 — WhatsApp retry link (?retry=slug&t=token) → seedha nayi photo screen
    const q = new URLSearchParams(window.location.search);
    const rs = q.get('retry'), rt = q.get('t');
    if (rs && rt) {
      const ctx: RetryCtx = { slug: rs, token: rt, mode: 'needs_photo', messages: ['हथेली साफ नहीं दिखी थी — नीचे से नई फोटो लें (कोई पैसा नहीं लगेगा)'] };
      lsSet(ctx); setRetry(ctx); setStep('retry');
      return;
    }
    const p = lsGet(); if (p?.mode === 'needs_photo') setPendingLs(p);
  }, []);

  // v3.2 — retry screen khulte waqt janm tithi khaali thi to khaana dikhao (bharte waqt gaayab na ho)
  useEffect(() => { if (step === 'retry') { setAskDob(!form.dob); setAskBirth(!form.tob || form.lat === null); } }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Photo aayi (camera ya gallery) → compress → VM jaanch ──
  const handlePhoto = useCallback(async (hand: Hand, photo: CapturedPhoto) => {
    setCamHand(null);
    setError('');
    const f = photo.file;
    if (!f.type.match(/image\/(jpeg|jpg|png|webp)/)) { setError('JPG, PNG ya WebP chahiye'); return; }
    if (f.size > 15 * 1024 * 1024) { setError('15MB se chhoti photo chunein'); return; }
    const set = hand === 'right' ? setRightPalm : setLeftPalm;
    let b64 = '';
    try { b64 = await compressImage(f); }
    catch { setError('Image process error — dobara try karein'); return; }
    set({ preview: photo.preview, b64, check: 'checking', message: '' });
    try {
      const r = await fetch('/api/palmistry/validate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_b64: b64 }),
      });
      const d = await r.json();
      if (!d?.checked) { set({ preview: photo.preview, b64, check: 'ok', message: '✓ फोटो जुड़ गई' }); return; }
      const probs: string[] = d.photo_problems || [];
      // v3.3 — galat haath / dhundhli: do baar roko, teesri baar sirf chetavni
      const n = ++tries.current[hand];
      const ulta = d.haath_disha === 'right' || d.haath_disha === 'left' ? d.haath_disha !== hand : false;
      const dhundhli = probs.includes('photo_dhundhli');
      void n; void ulta; void dhundhli; void probs;      // v3.4 — sirf haath na mile tab roko
      if (!d.hand_detected) {
        set({ preview: photo.preview, b64, check: 'bad', message: 'फोटो में हथेली नहीं मिली — हथेली कैमरे की ओर करके दोबारा लें' });
      } else {
        set({ preview: photo.preview, b64, check: 'ok', message: `✓ ${HAND_HI[hand]} हाथ की फोटो ठीक है` });
      }
    } catch {
      set({ preview: photo.preview, b64, check: 'ok', message: '✓ फोटो जुड़ गई' });
    }
  }, []);

  const photosReady = () => {
    const ps = [rightPalm, leftPalm].filter(Boolean) as PalmImage[];
    return ps.length > 0 && ps.every(p => p.check !== 'checking') && ps.some(p => p.check !== 'bad');
  };
  const usablePhotos = () => ({
    right: rightPalm && rightPalm.check !== 'bad' ? rightPalm : null,
    left:  leftPalm  && leftPalm.check  !== 'bad' ? leftPalm  : null,
  });

  /** v3.3 — janm samay + sthaan (dono hon tabhi bhejo). */
  const birthFields = () => (form.tob && form.lat !== null && form.lon !== null && form.tz !== null
    ? { birth_tob: form.tob, birth_place: form.place, birth_lat: form.lat, birth_lon: form.lon, birth_tz: form.tz }
    : {});

  const showResult = (data: any) => {
    setResult(data);
    if (data.retry_token && data.slug) {
      setRetry({ slug: data.slug, token: data.retry_token, mode: 'retry', messages: data.quality_notes || [] });
    }
    lsSet(null);
    setPendingLs(null);
    setStep('result');
  };

  /**
   * Everything after the money is taken. PayPal, Razorpay aur Play — teeno yahi ek
   * raasta chalate hain (413, review, needs_photo, galti ka sandesh — kabhi alag nahi).
   */
  const runAnalysis = async (proof: Record<string, string>) => {
    setStep('analyzing');
    setMsgIdx(0);
    const t0 = Date.now();
    const per = MIN_ANALYSIS_MS / ANALYSIS_STEPS.length;
    // v3.4 — har ~5.6s ek kadam tick; aakhri kadam par jawab aane tak rukta hai
    const timer = setInterval(() => {
      setMsgIdx(Math.min(ANALYSIS_STEPS.length - 1, Math.floor((Date.now() - t0) / per)));
    }, 400);
    const waitMin = async () => {
      const left = MIN_ANALYSIS_MS - (Date.now() - t0);
      if (left > 0) await new Promise(r => setTimeout(r, left));
      setMsgIdx(ANALYSIS_STEPS.length);
    };
    try {
      const u = usablePhotos();
      const res = await fetch('/api/palmistry/paid-analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...proof,
          ...toVmPhotos(u.right, u.left),
          user_name: form.userName, user_mobile: form.mobile,
          gender: form.gender, language: form.language,
          dob: form.dob || '', photo_consent: form.consent,
          ...birthFields(),                                 // v3.3
        }),
      });
      if (res.status === 413) {
        throw new Error('Photos bahut badi thi — page refresh karke dobara try karein. Aapka payment safe hai.');
      }
      let data: any = null;
      try { data = await res.json(); }
      catch {
        throw new Error('Server se jawab nahi mil paya — aapka payment safe hai, kripya WhatsApp par humse sampark karein.');
      }
      if (!res.ok || !data.success) throw new Error(data.error || 'Analysis failed — payment safe hai, WhatsApp par sampark karein');
      if (data.needs_photo) {
        const ctx: RetryCtx = { slug: data.slug, token: data.retry_token, mode: 'needs_photo', messages: data.photo_message || [] };
        setRetry(ctx); lsSet(ctx);
        setRightPalm(null); setLeftPalm(null);
        setStep('retry');
        return;
      }
      if (data.pending_review) { setWaUrl(data.whatsappUrl || ''); setStep('review'); return; }
      await waitMin();                                   // v3.4 — kam se kam 45 second
      showResult(data);
    } finally {
      clearInterval(timer);
    }
  };

  /** PayPal has taken $7. The server re-verifies with PayPal before analysing. */
  const handlePayPalPaid = async (proof: { paypal_order_id: string }) => {
    setError('');
    try {
      await runAnalysis({ paypal_order_id: proof.paypal_order_id });
    } catch (e: any) {
      setError(e.message || 'Analysis error');
      setStep('upload');
    }
  };

  /** v2.6 — Play Store app checkout (Google Play Billing). */
  const handlePlayPay = async () => {
    try {
      const purchase = await purchaseWithPlay(PLAY_PRODUCTS.hast_rekha);
      if (!purchase.ok) {
        if (!purchase.cancelled) setError(purchase.error);
        setStep('upload');
        return;
      }
      await runAnalysis({ play_purchase_token: purchase.purchaseToken });
    } catch (e: any) {
      setError(e.message || 'Analysis error');
      setStep('upload');
    }
  };

  const handlePay = async () => {
    if (!photosReady()) { setError('Kam se kam ek haath ki saaf photo zaroori hai'); return; }
    setStep('paying'); setError('');

    // v2.6 — Play Store app: Google Play only (checked FIRST).
    if (inPlayApp || await isPlayBillingAvailable()) {
      await handlePlayPay();
      return;
    }

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
          description: 'Hast Rekha Report — Hastasanjeevanam',
          image:       '/Trikal_Logo.png',
          prefill:     { name: form.userName, contact: form.mobile },
          theme:       { color: GOLD },
          handler: async (response: any) => {
            try {
              await runAnalysis({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              });
              resolve();
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

  // ── Muft dobara-photo bhejna ──
  const submitRetry = async () => {
    if (!retry || !photosReady()) { setError('Kam se kam ek haath ki saaf photo zaroori hai'); return; }
    setRetryBusy(true); setError('');
    try {
      const u = usablePhotos();
      const res = await fetch('/api/palmistry/retry', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: retry.slug, retry_token: retry.token, ...toVmPhotos(u.right, u.left), photo_consent: form.consent, dob: form.dob || '', ...birthFields() }),
      });
      if (res.status === 413) throw new Error('Photo bahut badi thi — dobara lein.');
      let data: any = null;
      try { data = await res.json(); } catch { throw new Error('Server se jawab nahi mila — aapki muft koshish bachi hai, dobara try karein.'); }
      if (data?.photo_problem) {
        setRetry({ ...retry, messages: data.photo_message?.length ? data.photo_message : ['हथेली साफ नहीं दिखी — दोबारा लें'] });
        setError('Is photo mein bhi hatheli saaf nahi padhi gayi — aapki muft koshish abhi bachi hai, ek baar aur lein.');
        return;
      }
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Report dobara nahi ban payi');
      showResult(data);
    } catch (e: any) {
      setError(e.message || 'Kuch galat hua — dobara try karein');
    } finally {
      setRetryBusy(false);
    }
  };

  const openRetry = (ctx: RetryCtx) => {
    setRetry(ctx); setRightPalm(null); setLeftPalm(null); setError(''); setStep('retry');
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  };

  const reset = () => { setStep('upload'); setResult(null); setRightPalm(null); setLeftPalm(null); setRetry(null); setError(''); };

  // v3.3 — janm samay + sthaan ke khaane (upload aur retry dono screen par)
  const birthInputs = (
    <div className="col-span-2 rounded-xl p-3 flex flex-col gap-3" style={{ background: GOLD_RGBA(0.05), border: `1px solid ${GOLD_RGBA(0.35)}` }}>
      <p className="text-xs leading-relaxed" style={{ color: '#E5D08A', margin: 0 }}>
        💒 <strong>शादी कब होगी</strong> — जन्म तिथि, समय और स्थान दें तो यह हिस्सा आपकी <strong>जन्म-कुंडली</strong> से रिपोर्ट में जुड़ेगा
        (ग्रंथ में शादी के समय का श्लोक नहीं है, इसलिए हाथ से नहीं)। <span className="text-slate-400">इच्छा पर — न दें तो भी पूरी रिपोर्ट मिलेगी।</span>
      </p>
      <label className="flex flex-col gap-1.5 text-xs text-slate-400">जन्म समय
        <input type="time" value={form.tob} onChange={e => setForm(p => ({ ...p, tob: e.target.value }))}
          className="w-full rounded-lg px-3 min-h-[46px] text-white text-[15px] focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', colorScheme: 'dark' }} />
      </label>
      <div className="flex flex-col gap-1.5 text-xs text-slate-400">
        <label htmlFor="hr-birth-place">जन्म स्थान</label>
        <CityInput id="hr-birth-place" value={form.place}
          onSelect={(city, lat, lng, tz) => setForm(p => ({ ...p, place: city, lat, lon: lng, tz }))} />
      </div>
      {form.tob && form.lat !== null && !form.dob && (
        <p className="text-xs" style={{ color: '#FCD34D', margin: 0 }}>शादी का समय निकालने के लिए ऊपर जन्म तिथि भी भरें।</p>
      )}
    </div>
  );

  const camera = camHand && (
    <GuidedPalmCamera handLabel={HAND_HI[camHand]}
      onCapture={p => handlePhoto(camHand, p)} onClose={() => setCamHand(null)} />
  );

  const slots = (
    <>
      <div className="grid grid-cols-2 gap-3">
        <PhotoSlot hand="right" image={rightPalm} mukhya={mukhya === 'right'} onOpen={() => setCamHand('right')} />
        <PhotoSlot hand="left" image={leftPalm} mukhya={mukhya === 'left'} onOpen={() => setCamHand('left')} />
      </div>
      <p className="text-xs text-center text-slate-400 mt-2 leading-relaxed">
        ग्रंथ (३.१.६): पुरुष का दायाँ, स्त्री का बायाँ हाथ मुख्य। दोनों भेजें तो और बेहतर।
      </p>
    </>
  );

  // ═══ UPLOAD ═══
  if (step === 'upload' || step === 'paying') return (
    <>
      <SiteNav />
      {camera}
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-2xl mx-auto">

          <nav className="text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-slate-300">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/calculators" className="hover:text-slate-300">Calculators</Link>
            <span className="mx-2">›</span>
            <span style={{ color: GOLD }}>Hast Rekha</span>
          </nav>

          {pendingLs && (
            <div className="rounded-xl p-4 mb-5 flex flex-col gap-3" style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.45)' }}>
              <p className="text-sm" style={{ color: '#FDE68A' }}>
                आपकी पिछली रिपोर्ट के लिए नई फोटो बाकी है — पैसे दोबारा नहीं लगेंगे।
              </p>
              <button type="button" onClick={() => openRetry(pendingLs)}
                className="min-h-[44px] rounded-lg font-semibold text-sm" style={{ background: '#FBBF24', color: '#1A1200' }}>
                नई फोटो भेजें
              </button>
            </div>
          )}

          <div className="text-center mb-7">
            <p className="text-xs font-semibold tracking-[0.25em] mb-3" style={{ color: GOLD_RGBA(0.8) }}>
              HASTASANJEEVANAM · ग्रंथ-आधारित
            </p>
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 leading-tight" style={{ color: GOLD }}>
              Hast Rekha Calculator
            </h1>
            <p className="text-base md:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
              Bas hatheli ki photo — aur aapki report granth <strong>Hastasanjeevanam</strong> ke shlokon se:
              beeta samay, abhi ka daur, aage ka bhagya, apna ghar, naukri ya business, padhai, vivah aur santaan yog, shubh varsh, 7 graha-sthaan aur upay. Lagbhag ek minute mein poori report, PDF hamesha ke liye.
            </p>
            {/* v3.3 — jeevan ke sawaal (sab report mein sach mein hain) */}
            <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-xl mx-auto">
              {['💒 शादी कब (कुंडली से)', '💍 विवाह-योग', '🏠 अपना घर', '💼 नौकरी या बिज़नेस', '📚 पढ़ाई', '👶 संतान-योग', '✨ आने वाले शुभ वर्ष'].map(t => (
                <span key={t} className="rounded-full px-3 py-1.5 text-xs" style={{ background: GOLD_RGBA(0.10), border: `1px solid ${GOLD_RGBA(0.35)}`, color: '#F0E2A8' }}>{t}</span>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3 max-w-md mx-auto leading-relaxed">
              हर जवाब के साथ ग्रंथ का श्लोक। जहाँ ग्रंथ चुप है, वहाँ हम भी चुप — कोई उम्र, मृत्यु या डर नहीं।
            </p>
          </div>

          <div className="flex items-center gap-3 mb-7 p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <img src="/Rohiit-Gupta.jpg" alt="Rohiit Gupta, Chief Vedic Architect, Trikaal Vaani"
              className="w-12 h-12 rounded-full object-cover shrink-0" style={{ border: `1px solid ${GOLD_RGBA(0.4)}` }} />
            <div className="text-sm">
              <div className="font-semibold" style={{ color: GOLD }}>Rohiit Gupta</div>
              <div className="text-slate-400">Chief Vedic Architect · 16+ saal Jyotish anubhav</div>
              <div className="text-xs text-slate-500 mt-0.5">Granth: Hastasanjeevanam · Upay: BPHS</div>
            </div>
          </div>

          {slots}

          <div className="rounded-xl p-4 mt-5 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)' }}>
            <p className="font-semibold text-sm mb-2" style={{ color: GOLD }}>अच्छी फोटो कैसे लें</p>
            {['1. दिन की रोशनी, फ्लैश बंद', '2. हथेली पूरी खुली, उँगलियाँ थोड़ी फैली', '3. फोन हथेली के ठीक ऊपर', '4. कलाई से उँगलियों तक पूरा हाथ फ्रेम में'].map(t => (
              <p key={t} className="text-sm text-slate-300 leading-relaxed">{t}</p>
            ))}
            <p className="text-xs text-slate-500 mt-2">कैमरा खुलते ही बताता है — रोशनी ठीक है या नहीं, हाथ स्थिर है या नहीं।</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <label className="col-span-2 flex flex-col gap-1.5 text-xs text-slate-400">आपका नाम
              <input type="text" placeholder="PDF में आएगा" value={form.userName}
                onChange={e => setForm(p => ({ ...p, userName: e.target.value }))}
                className="w-full rounded-lg px-3 min-h-[46px] text-white text-[15px] focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }} />
            </label>
            <label className="col-span-2 flex flex-col gap-1.5 text-xs text-slate-400">WhatsApp नंबर
              <input type="tel" inputMode="numeric" maxLength={10} placeholder="रिपोर्ट लिंक के लिए (10 अंक)" value={form.mobile}
                onChange={e => setForm(p => ({ ...p, mobile: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) }))}
                className="w-full rounded-lg px-3 min-h-[46px] text-white text-[15px] focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs text-slate-400">पुरुष / स्त्री
              <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value as 'M' | 'F' }))}
                className="w-full rounded-lg px-3 min-h-[46px] text-white text-[15px] focus:outline-none"
                style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.12)' }}>
                <option value="M">पुरुष</option>
                <option value="F">स्त्री</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-xs text-slate-400">भाषा
              <select value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value as FormState['language'] }))}
                className="w-full rounded-lg px-3 min-h-[46px] text-white text-[15px] focus:outline-none"
                style={{ background: '#111520', border: '1px solid rgba(255,255,255,0.12)' }}>
                <option value="hi">हिंदी</option>
                <option value="hinglish">Hinglish</option>
                <option value="en">English</option>
              </select>
            </label>
            <label className="col-span-2 flex flex-col gap-1.5 text-xs text-slate-400">
              <span>जन्म तिथि <span style={{ color: '#C9A635' }}>(इच्छा पर — इससे रिपोर्ट में आपके आने वाले शुभ वर्ष भी जुड़ेंगे)</span></span>
              <input type="date" value={form.dob} max={new Date().toISOString().slice(0, 10)}
                onChange={e => setForm(p => ({ ...p, dob: e.target.value }))}
                className="w-full rounded-lg px-3 min-h-[46px] text-white text-[15px] focus:outline-none"
                style={{ background: GOLD_RGBA(0.05), border: `1px solid ${GOLD_RGBA(0.45)}`, colorScheme: 'dark' }} />
            </label>
            {birthInputs}
          </div>

          <label className="flex gap-3 items-start rounded-xl p-3 mb-5 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)' }}>
            <input type="checkbox" checked={form.consent} onChange={e => setForm(p => ({ ...p, consent: e.target.checked }))}
              className="w-[22px] h-[22px] mt-0.5 shrink-0" style={{ accentColor: GOLD }} />
            <span className="text-[13px] leading-relaxed text-slate-300">
              मेरी हथेली की फोटो (बिना नाम-नंबर के) Trikaal Vaani का इंजन बेहतर बनाने में इस्तेमाल हो सकती है।
              <span className="text-slate-500"> (इच्छा पर — न चुनें तो भी पूरी रिपोर्ट मिलेगी)</span>
            </span>
          </label>

          {error && (
            <div className="rounded-lg px-4 py-3 mb-4 text-red-300 text-sm"
              style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>⚠️ {error}</div>
          )}

          {/* CTA — v2.4: currency follows the visitor */}
          {isIndia === false && !inPlayApp ? (
            <div>
              {!photosReady() && (
                <p className="text-center text-xs mb-2" style={{ color: '#94a3b8' }}>
                  Add a clear palm photo first.
                </p>
              )}
              <div style={{ opacity: photosReady() ? 1 : 0.4, pointerEvents: photosReady() ? 'auto' : 'none' }}>
                <PayPalCheckout
                  productKey="hast_rekha"
                  onPaid={(proof) => handlePayPalPaid({ paypal_order_id: proof.paypal_order_id })}
                  onError={(m) => setError(m)}
                  disabled={!photosReady() || step === 'paying'}
                />
              </div>
            </div>
          ) : (
            <button onClick={handlePay} disabled={!photosReady() || step === 'paying'}
              className="w-full min-h-[54px] rounded-xl font-bold text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: GOLD, color: '#080B12' }}>
              {step === 'paying' ? '⏳ Payment Processing...' : 'रिपोर्ट बनाएँ — ₹51'}
            </button>
          )}
          <p className="text-center text-xs mt-2" style={{ color: '#9CA3AF' }}>ग्रंथ हस्तसंजीवनम् · हर बात के साथ श्लोक · PDF हमेशा के लिए</p>

          <div className="mt-4 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-semibold mb-2 tracking-wide" style={{ color: GOLD_RGBA(0.85) }}>REPORT MEIN KYA HAI</p>
            <div className="grid grid-cols-2 gap-1.5">
              {['Har baat ke saath granth ka shlok', 'Beeta samay · Abhi · Aage', 'Budhapa aur sehat', 'Aapke haath ke 7 graha-sthaan',
                'Sahayak graha + 3 upay (BPHS)', 'Hindi / Hinglish / English', 'Vivah-yog · Santaan-yog (granth)', 'PDF Download ✓',
                // v3.3 — naye sawaal
                'Shaadi kab — Kundali se (janm samay dein)', 'Apna ghar · Naukri ya business',
                'Padhai — vidya / aacharya yog', 'Aane wale shubh varsh (janm tithi dein)'].map((item) => (
                <div key={item} className="flex gap-2 text-xs text-slate-400">
                  <span style={{ color: GOLD }}>◈</span><span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-slate-500 text-xs mt-4">
            {inPlayApp
              ? 'Secure payment via Google Play. Instant unlock. · Photo save nahi hoti — jab tak aap upar haan na chunein · One-time ₹51'
              : isIndia === false
              ? 'Secure payment via PayPal — or pay by card without a PayPal account · Your photo is not stored unless you tick the box above · One-time $7'
              : 'Secure payment via Razorpay · Photo save nahi hoti — jab tak aap upar haan na chunein · One-time ₹51'}
          </p>

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

          <section className="mt-12">
            <h2 className="text-xl font-serif font-bold mb-4" style={{ color: GOLD }}>Haath Ki Rekhaen Kya Batati Hain?</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Granth Hastasanjeevanam (3.3.6) ke anusaar Pitr Rekha (angoothe ko gherne wali) bachpan batati hai,
              Matr ya Dhan Rekha (hatheli ke beech ki aadi) jawani aur kamaai ka daur, aur Aayu Rekha (ungliyon ke neeche)
              budhapa. Kalaai se ungliyon ki or jaane wali Urdhva Rekha (aajkal bhagya rekha) batati hai ki aage kaam aur pad
              ka raasta kis or jayega (3.5.8–3.5.11). Trikaal Vaani ka engine yahi rekhaen aapki photo mein naapta hai aur
              granth ke shlok ke saath report deta hai.
            </p>
          </section>

          <section className="mt-10 grid sm:grid-cols-3 gap-3">
            {[
              { href: '/calculators/free-janam-kundali-calculator', label: 'Free Kundli Calculator', emoji: '🔮' },
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

  // ═══ ANALYZING ═══ (v3.4 — 8 kadam, kam se kam 45s)
  if (step === 'analyzing') {
    const shown = ANALYSIS_STEPS.filter((_, i) => i !== 5 || (form.tob && form.lat !== null && form.dob));
    const doneN = Math.min(msgIdx, ANALYSIS_STEPS.length);
    const doneShown = ANALYSIS_STEPS.slice(0, doneN).filter((_, i) => i !== 5 || (form.tob && form.lat !== null && form.dob)).length;
    const pct = Math.round((doneN / ANALYSIS_STEPS.length) * 100);
    return (
      <>
        <SiteNav />
        <main className="min-h-screen pt-24 pb-16 px-4 flex flex-col items-center" style={{ background: '#080B12', color: '#E5E7EB' }}>
          <div className="w-full max-w-md flex flex-col gap-5">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse" aria-hidden="true">🔮</div>
              <h2 className="text-2xl font-serif font-bold" style={{ color: GOLD }}>आपकी हस्त रेखा पढ़ी जा रही है</h2>
              <p className="text-sm text-slate-400 mt-1">ग्रंथ हस्तसंजीवनम् से — हर रेखा, हर पर्व</p>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: GOLD }} />
            </div>
            <ul className="flex flex-col gap-2.5" aria-live="polite">
              {shown.map((label, i) => {
                const done = i < doneShown;
                const now = i === doneShown;
                return (
                  <li key={label} className="flex items-center gap-3 text-[15px]"
                    style={{ color: done ? '#E5E7EB' : now ? GOLD : '#6B7280' }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0"
                      style={done ? { background: '#16A34A', color: '#fff' } : now ? { border: `2px solid ${GOLD}` } : { border: '1px solid #374151' }}>
                      {done ? '✓' : now ? <span className="animate-pulse">•</span> : ''}
                    </span>
                    {label}
                  </li>
                );
              })}
            </ul>
            <p className="text-slate-500 text-xs text-center">लगभग 1 मिनट — कृपया पेज बंद न करें</p>
          </div>
        </main>
      </>
    );
  }

  // ═══ RETRY — muft dobara-photo (ya needs_photo) ═══
  if (step === 'retry' && retry) return (
    <>
      <SiteNav />
      {camera}
      <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-md mx-auto flex flex-col gap-4">
          <h1 className="text-2xl font-serif font-bold" style={{ color: GOLD }}>नई फोटो — मुफ्त</h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            {retry.mode === 'needs_photo'
              ? 'आपका पेमेंट मिल गया है। पर फोटो में हथेली साफ नहीं पढ़ी जा सकी, इसलिए रिपोर्ट अभी नहीं बनी। नई फोटो भेजें — पैसे दोबारा नहीं लगेंगे।'
              : 'पैसे दोबारा नहीं लगेंगे। नई फोटो से पूरी रिपोर्ट फिर बनेगी और पुरानी की जगह ले लेगी — PDF भी।'}
          </p>
          {retry.messages.length > 0 && (
            <div className="rounded-xl p-3" style={{ background: GOLD_RGBA(0.08) }}>
              <p className="text-sm font-semibold mb-1" style={{ color: GOLD }}>पिछली फोटो में यह कमी थी</p>
              {retry.messages.map(m => <p key={m} className="text-sm text-slate-300 leading-relaxed">{m}</p>)}
            </div>
          )}
          {slots}
          {askDob && (
            <label className="flex flex-col gap-1.5 text-xs text-slate-400">
              <span>जन्म तिथि <span style={{ color: '#C9A635' }}>(इच्छा पर — इससे रिपोर्ट में आपके आने वाले शुभ वर्ष भी जुड़ेंगे)</span></span>
              <input type="date" value={form.dob} max={new Date().toISOString().slice(0, 10)}
                onChange={e => setForm(p => ({ ...p, dob: e.target.value }))}
                className="w-full rounded-lg px-3 min-h-[46px] text-white text-[15px] focus:outline-none"
                style={{ background: GOLD_RGBA(0.05), border: `1px solid ${GOLD_RGBA(0.45)}`, colorScheme: 'dark' }} />
            </label>
          )}
          {askBirth && <div className="grid grid-cols-2">{birthInputs}</div>}
          {error && (
            <div className="rounded-lg px-4 py-3 text-red-300 text-sm"
              style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)' }}>⚠️ {error}</div>
          )}
          <button type="button" onClick={submitRetry} disabled={!photosReady() || retryBusy}
            className="min-h-[52px] rounded-xl font-bold text-base disabled:opacity-30" style={{ background: GOLD, color: '#080B12' }}>
            {retryBusy ? 'रिपोर्ट बन रही है…' : retry.mode === 'needs_photo' ? 'रिपोर्ट बनाएँ' : 'रिपोर्ट दोबारा बनाएँ'}
          </button>
          <p className="text-xs text-center text-slate-500">
            {retry.mode === 'needs_photo' ? 'जब तक हथेली साफ न पढ़ी जाए, आप दोबारा भेज सकते हैं' : 'यह सुविधा हर रिपोर्ट पर एक बार'}
          </p>
          {retry.mode === 'retry' && result && (
            <button type="button" onClick={() => { setError(''); setStep('result'); }}
              className="min-h-[44px] rounded-xl text-sm text-slate-400" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
              पुरानी रिपोर्ट पर वापस जाएँ
            </button>
          )}
        </div>
      </main>
    </>
  );

  // ═══ REVIEW — sirf jab server band ho (VM error) ═══
  if (step === 'review') return (
    <>
      <SiteNav />
      <main className="min-h-screen pt-20 pb-16 px-4 flex flex-col items-center justify-center"
        style={{ background: '#080B12', color: '#E5E7EB' }}>
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-6">🔱</div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold mb-4" style={{ color: GOLD }}>
            Aapki Report Thodi Der Mein
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
            Hamara server abhi vyast hai. Aapki photo surakshit hai aur report apne aap dobara banegi —
            agle <strong style={{ color: GOLD }}>30 minute</strong> mein WhatsApp par bheji jayegi.
          </p>
          <div className="rounded-xl p-5 mb-6" style={{ background: GOLD_RGBA(0.06), border: `1px solid ${GOLD_RGBA(0.2)}` }}>
            <p className="text-sm text-slate-400 leading-relaxed">
              ✓ Aapka payment safe hai<br />
              ✓ Report apne aap banegi<br />
              ✓ Koi extra charge nahi
            </p>
          </div>
          {waUrl && (
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-base mb-3"
              style={{ background: '#25D366', color: '#fff' }}>
              WhatsApp Par Confirm Karein
            </a>
          )}
          <Link href="/"
            className="inline-block w-full py-3 rounded-xl text-slate-500 hover:text-slate-300 text-sm"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            Home Par Wapas Jayein
          </Link>
        </div>
      </main>
    </>
  );

  // ═══ RESULT ═══
  if (step === 'result' && result) {
    const { report, mp_features, pdf_b64, pdf_url } = result;
    const granth: GranthReportData | null = report?.granth_report ?? null;
    const kam = Number(granth?.meta?.kam ?? 0);
    const usedHand: Hand | null = mp_features?.hand_used === 'left' ? 'left' : mp_features?.hand_used === 'right' ? 'right' : null;
    const mukhyaHaath: Hand | null = mp_features?.mukhya_haath === 'left' ? 'left' : mp_features?.mukhya_haath === 'right' ? 'right' : null;
    const weak = kam > 0 || (usedHand && mukhyaHaath && usedHand !== mukhyaHaath);
    const canRetry = !!(result.free_retry_available && retry?.token);
    const today = new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    const shareText = pdf_url ? `मेरी हस्त रेखा रिपोर्ट (Trikaal Vaani, ग्रंथ हस्तसंजीवनम्): ${pdf_url}` : '';

    return (
      <>
        <SiteNav />
        <main className="min-h-screen pt-20 pb-16 px-4" style={{ background: '#080B12', color: '#E5E7EB' }}>
          <div className="max-w-2xl mx-auto flex flex-col gap-4">

            <div className="text-center flex flex-col gap-2">
              <p className="text-xs font-semibold tracking-[0.2em]" style={{ color: '#C9A635' }}>HASTASANJEEVANAM · ग्रंथ-आधारित</p>
              <h1 className="text-2xl md:text-3xl font-serif font-bold leading-snug" style={{ color: GOLD }}>
                {form.userName ? `${form.userName} जी, ` : ''}आपकी हस्त रेखा रिपोर्ट
              </h1>
              <p className="text-sm text-slate-400">{usedHand ? `${HAND_HI[usedHand]} हाथ से पढ़ी गई · ` : ''}{today}</p>
            </div>

            <div className="flex gap-2.5">
              {(pdf_b64 || pdf_url) && (
                pdf_b64 ? (
                  <button type="button" onClick={() => downloadPDF(pdf_b64, form.userName)}
                    className="flex-1 min-h-[48px] rounded-xl font-semibold text-[15px] text-white" style={{ background: '#16A34A' }}>
                    PDF डाउनलोड
                  </button>
                ) : (
                  <a href={pdf_url!} target="_blank" rel="noopener noreferrer"
                    className="flex-1 min-h-[48px] rounded-xl font-semibold text-[15px] text-white flex items-center justify-center" style={{ background: '#16A34A' }}>
                    PDF डाउनलोड
                  </a>
                )
              )}
              {shareText && (
                <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 min-h-[48px] rounded-xl font-semibold text-[15px] flex items-center justify-center"
                  style={{ border: '1px solid #25D366', color: '#4ADE80' }}>
                  WhatsApp पर भेजें
                </a>
              )}
            </div>

            {/* v3.4 — photo / dobara-photo patti hatayi (Rohiit: bahana nahi) */}
            {granth ? (
              <GranthReportView data={granth} />
            ) : (
              // Purani reports (engine v1.x) — saada text
              <div className="flex flex-col gap-3">
                {['hast_parichay', 'mukhya_rekhaen', 'vyaktitva', 'vyavsay_dhan', 'prem_vivah', 'swasthya', 'adhyatma'].map(k =>
                  report?.[k] ? (
                    <section key={k} className="rounded-xl p-4 text-sm leading-relaxed text-slate-300 whitespace-pre-line"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>{report[k]}</section>
                  ) : null)}
              </div>
            )}

            <section className="rounded-2xl p-4" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(96,165,250,0.35)' }}>
              <h2 className="font-semibold text-[15px] mb-2" style={{ color: '#93C5FD' }}>रत्न के बारे में सच</h2>
              <p className="text-sm leading-relaxed mb-3" style={{ color: '#CBD5E1' }}>
                रत्न हथेली से नहीं, कुंडली से तय होता है। गलत रत्न नुकसान करता है — इसलिए यह रिपोर्ट कोई रत्न नहीं बताती।
              </p>
              <Link href="/calculators/free-gemstone-suitability-calculator"
                className="min-h-[44px] rounded-lg text-sm font-semibold flex items-center justify-center"
                style={{ border: '1px solid rgba(96,165,250,0.5)', color: '#93C5FD' }}>
                मुफ्त रत्न जाँच →
              </Link>
            </section>

            <section className="rounded-2xl p-5 text-center flex flex-col items-center gap-3"
              style={{ background: `linear-gradient(160deg, ${GOLD_RGBA(0.18)}, rgba(8,11,18,0.9))`, border: `1px solid ${GOLD_RGBA(0.45)}` }}>
              <h3 className="font-serif font-bold text-lg" style={{ color: GOLD }}>अब सवाल &ldquo;कब&rdquo; का है?</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>हथेली बताती है क्या — कब, यह आपकी जन्म कुंडली बताती है।</p>
              <Link href="/#birth-form"
                className="min-h-[48px] px-6 rounded-full font-bold text-[15px] flex items-center"
                style={{ background: GOLD, color: '#080B12' }}>
                कुंडली रीडिंग ₹51 →
              </Link>
            </section>

            <button type="button" onClick={reset}
              className="min-h-[44px] rounded-xl text-slate-500 hover:text-slate-300 text-sm"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              किसी और की नई रिपोर्ट बनाएँ
            </button>
          </div>
        </main>
        <HastRekhaFooter />
      </>
    );
  }

  return null;
}
