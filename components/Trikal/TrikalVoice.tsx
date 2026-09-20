'use client';

/**
 * ============================================================
 * TRIKAL VAANI — Trikaal Voice Widget
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/Trikal/TrikalVoice.tsx
 * VERSION: 3.5 (19 Sep 2026) — CLOSED PILL RESTYLED VIOLET
 *   WHY: the pill was gold on a gold site, so it read as decoration rather
 *   than as a product. Violet is far from the site's gold AND from the
 *   picker's orange, and violet is the established "voice" colour (Siri).
 *   Cyan was considered and rejected — too close to the WhatsApp green that
 *   already appears in the picker.
 *   WHAT CHANGED — the closed pill ONLY:
 *     • deep violet gradient + WHITE text (dark text on deep violet measures
 *       3.4:1 and fails WCAG AA; white measures 5.7:1 and passes)
 *     • height 64px -> 46px (circle 36->28, padding 14->9, text 14->13).
 *       46px keeps it above the 44px minimum tap target.
 *     • attention blink every 5s, SIX times, then permanently still (30s).
 *       Soft glow + slight scale, never an opacity flash: flashing breaks
 *       WCAG 2.3.1 and a permanently animating element stops being seen.
 *     • the old constant `trikalPulse` ring on the icon is gone — the 30s
 *       blink replaces it, so only one thing moves.
 *   WHAT DID NOT CHANGE: the modal. It is still gold, still uses GOLD/
 *   GOLD_DARK/GOLD_LIGHT, and not one line of its logic was touched. The
 *   violet constants below are used by the closed pill and nothing else.
 * VERSION: 3.4 (18 Sep 2026) — GEO RACE + two defects from 3.3
 *   /api/geo was checked live on 18 Sep and is healthy: it reads Vercel's
 *   x-vercel-ip-country and returned {"country":"US","isIndia":false} from a
 *   US egress. The two "International cards are not supported" failures in the
 *   Razorpay log are dated 22 Aug 2026 — eight days BEFORE the PayPal path
 *   reached this widget in v3.2 (30 Aug). They are already fixed.
 *   v3.4 CHANGES:
 *     - isIndia === null now renders a loader. Until 3.3 an unresolved geo
 *       fell through to the RUPEE branch, because `null === false` is false.
 *       The window is small — the widget is mounted in app/layout.tsx so the
 *       geo fetch starts at page load — but on a slow connection a foreign
 *       visitor could tap a rupee pack and be rejected by Razorpay.
 *     - FIX to 3.3: the activation-failure message told the user to send a
 *       payment ID that was never shown to them. The ID is now in the message.
 *     - FIX to 3.3: that failure path console.logged the entire `proof`
 *       object, putting razorpay_signature in the visitor's browser console.
 *       Only the order and payment ids are logged now.
 *   STILL OPEN, not in this file: there is no Razorpay webhook, so a payment
 *   captured while the browser dies is never activated. The PayPal voice path
 *   has zero production captures to date and is untested live (?intl=1 forces
 *   the dollar view for testing).
 *
 * VERSION: 3.3 (18 Sep 2026) — CHECKOUT RELIABILITY
 *   Razorpay data for 19 Aug–18 Sep 2026 showed 18 voice-pack checkout
 *   attempts, 8 captured, 10 failed. Supabase `voice_packs` held 80 rows for
 *   those 18 attempts — 8 of them duplicate orders created inside the same
 *   second by one session (one session made 5 orders in 1.4s). Cause: the pack
 *   button had no in-flight lock and gave no feedback while the order was being
 *   created, so an impatient user tapped it again and again, each tap minting a
 *   fresh Razorpay order and a fresh pending row.
 *   v3.3 CHANGES:
 *     - `buying` lock: the pack button is disabled and shows "Opening…" from
 *       the moment it is tapped until the Razorpay sheet is open or the attempt
 *       ends. One tap = one order. This is what stops the duplicate rows.
 *     - `rzp.on('payment.failed')`: the real reason from the issuer is now
 *       shown to the user with a retry line, instead of the blanket
 *       "Payment cancelled" that ondismiss used to paint over everything.
 *       Note: lib/razorpay-helper.ts has such a handler but only console.errors
 *       it; this widget does not use that helper, and deliberately shows the
 *       reason on screen.
 *     - ondismiss no longer overwrites an already-set failure message.
 *     - activatePack retries /api/verify-voice-pack twice on a network error.
 *       Money is already taken at that point; a single failed fetch used to
 *       leave the pack unactivated with no second chance. There is still no
 *       Razorpay webhook — that safety net is a separate, pending job.
 *     - the empty `catch {}` in handleBuyPack now logs, so failures are
 *       visible in Vercel logs instead of vanishing.
 *   NOT CHANGED: pricing, PayPal path, activatePack's contract, the server
 *   routes, and `questions_left` (a GENERATED ALWAYS column in Postgres —
 *   never write to it).
 *
 * VERSION: 3.2 (30 Aug 2026) — INTERNATIONAL PAYMENT (packs $1 / $4 / $7)
 *   Testing on 30 Aug found the card outside this modal showing "$1" while the
 *   modal itself opened a RUPEE Razorpay sheet at Rs 11. Only the BirthForm
 *   voice tier had been moved to PayPal; this widget had not, so the price a
 *   foreign visitor read and the price they were charged disagreed.
 *   Visitors outside India now pick a pack and pay in dollars — $1 / $4 / $7
 *   (repriced from $1 / $5 / $12 on 30 Aug; the tiers now carry a volume
 *   discount rather than a flat per-question rate). Everything after the money is
 *   taken lives in activatePack(), shared by both paths, so a dollar buyer's
 *   balance and validity are computed by the identical code as a rupee buyer's.
 *   handleBuyPack and its Razorpay call are otherwise unchanged.
 *
 * VERSION: 3.0 — Stale-closure fix: prediction now gets the birth details
 * DATE: 2026-06-14
 * CHANGES:
 *   v3.0: FIX for prediction arriving with blank birth details despite the
 *         form being filled. handlePttDown is memoized ([]), so its onstop
 *         closure froze the mount-time (empty) `form`. processAudio now reads
 *         formRef.current / balanceRef.current / activePackRef.current —
 *         always-current refs synced via effects + set on form submit.
 *   v2.9: PTT via raw touch/mouse events (Android-reliable hold-to-record).
 *   v2.8: Details mic made a single persistent button (no unmount on record).
 *   v2.7: Shared-phone safety (voice-fill = full field reset + confirm).
 *   v2.6: setPointerCapture PTT fix — finger drift no longer cuts record.
 *   v2.5: Voice-fill birth details (Option A) + "Session required" race fix.
 *   v2.4: PTT (Press & Hold) mic — WhatsApp style.
 *         onTouchStart → start; onTouchEnd/Cancel → stop + submit.
 *         touch-action: none on mic button (mobile scroll fix).
 *   v2.2: Kill switch (NEXT_PUBLIC_ENABLE_VOICE) — unchanged.
 * ============================================================
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import PayPalCheckout from '@/components/payment/PayPalCheckout';

const GOLD       = '#D4AF37';
const GOLD_LIGHT = '#F5D76E';
const GOLD_DARK  = '#A8820A';
const BG_DARK    = '#080B12';

/* Closed-pill palette (v3.5). Used by the pill only — the modal stays gold. */
const V_DARK     = '#5B21B6';   // gradient start
const V_MID      = '#7C3AED';   // gradient middle
const V_LIGHT    = '#9D5CFF';   // gradient end
const V_ICON     = '#C89CFF';   // mic stroke inside the dark circle
const ON_VIOLET  = '#FFFFFF';   // 5.7:1 on V_MID — dark text would be 3.4:1
const BG_CARD    = 'rgba(8,11,18,0.97)';

// v1.1: usdLabel added. Testing on 30 Aug found this modal showing "$1" on the
// card outside and then opening a RUPEE Razorpay sheet — only the BirthForm
// voice tier had been moved to PayPal, this modal had not. Price and checkout
// must never disagree.
type Pack = { id: 'p11' | 'p51' | 'p101'; price: number; usdLabel: string; questions: number; validityDays: number; label: string; usdName: string; sub: string };

const PACKS: Pack[] = [
  { id: 'p11',  price: 11,  usdLabel: '$1', questions: 1,  validityDays: 1,  label: '₹11 — Try Trikaal',    usdName: '$1 — Try Trikaal',   sub: '1 voice question'      },
  { id: 'p51',  price: 51,  usdLabel: '$4', questions: 5,  validityDays: 7,  label: '₹51 — Sapt Darshan',   usdName: '$4 — Sapt Darshan',  sub: '5 questions • 7 days'  },
  { id: 'p101', price: 101, usdLabel: '$7', questions: 12, validityDays: 30, label: '₹101 — Trikaal Bhakt', usdName: '$7 — Trikaal Bhakt', sub: '12 questions • 30 days' },
];

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const TAGLINES = [
  'त्रिकाल से पूछें — आवाज़ में उत्तर',
  'Speak. Trikaal listens. Trikaal answers.',
  'Voice prediction in 60 seconds',
  'सच्चा ज्योतिष • असली आवाज़',
  'Ask anything. In your voice.',
];

type BirthForm = { name: string; dob: string; tob: string; pob: string };
type Stage = 'closed' | 'pricing' | 'form' | 'record' | 'processing' | 'reply';
type RecordPurpose = 'question' | 'details';
type FillStatus = 'idle' | 'parsing' | 'done' | 'partial';

export default function TrikalVoice() {

  // ── KILL SWITCH ─────────────────────────────────────────────
  if (process.env.NEXT_PUBLIC_ENABLE_VOICE !== 'true') return null;

  const [stage, setStage]           = useState<Stage>('closed');
  const [taglineIdx, setTaglineIdx] = useState(0);
  const [activePack, setActivePack] = useState<Pack | null>(null);
  const [sessionId, setSessionId]   = useState<string>('');
  const [balance, setBalance]       = useState<number>(0);
  const [validUntil, setValidUntil] = useState<string>('');
  const [form, setForm]             = useState<BirthForm>({ name: '', dob: '', tob: '', pob: '' });

  const [recording, setRecording]   = useState(false);
  const [seconds, setSeconds]       = useState(0);
  const [transcript, setTranscript] = useState('');
  const [reply, setReply]           = useState('');
  const [audioUrl, setAudioUrl]     = useState('');
  const [error, setError]           = useState('');
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  // Voice-fill state
  const [fillStatus, setFillStatus] = useState<FillStatus>('idle');
  const [voiceFilled, setVoiceFilled] = useState(false);  // true after a voice-fill (shared-phone safety)

  // Refs
  const pttStateRef      = useRef<'idle' | 'starting' | 'recording'>('idle');
  const recordPurposeRef = useRef<RecordPurpose>('question');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const timerRef         = useRef<NodeJS.Timeout | null>(null);
  const streamRef        = useRef<MediaStream | null>(null);
  const mimeTypeRef      = useRef<string>('');
  const sessionIdRef     = useRef<string>('');   // synchronous — fixes "Session required" race
  // Latest-value refs — processAudio is invoked from a frozen onstop
  // closure, so reading state directly there is STALE. Refs stay current.
  const formRef          = useRef<BirthForm>({ name: '', dob: '', tob: '', pob: '' });
  const balanceRef       = useRef<number>(0);
  const activePackRef    = useRef<Pack | null>(null);

  // ── Init session + restore balance ──────────────────────────
  useEffect(() => {
    let sid = localStorage.getItem('trikal_voice_session');
    if (!sid) {
      sid = `tv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem('trikal_voice_session', sid);
    }
    sessionIdRef.current = sid;   // available immediately, no render wait
    setSessionId(sid);

    const savedBal   = localStorage.getItem('trikal_voice_balance');
    const savedUntil = localStorage.getItem('trikal_voice_valid_until');
    if (savedBal && savedUntil && new Date(savedUntil) > new Date()) {
      setBalance(parseInt(savedBal, 10));
      setValidUntil(savedUntil);
    }

    const savedForm = localStorage.getItem('trikal_voice_form');
    if (savedForm) { try { setForm(JSON.parse(savedForm)); } catch {} }
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTaglineIdx(i => (i + 1) % TAGLINES.length), 3500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Keep latest-value refs in sync (read by processAudio's frozen closure)
  useEffect(() => { formRef.current       = form;       }, [form]);
  useEffect(() => { balanceRef.current    = balance;    }, [balance]);
  useEffect(() => { activePackRef.current = activePack; }, [activePack]);

  // ── Helpers ──────────────────────────────────────────────────
  const getSupportedMimeType = (): string => {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4', ''];
    return types.find(t => t === '' || MediaRecorder.isTypeSupported(t)) ?? '';
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  // ── PTT state machine: 'idle' → 'starting' → 'recording' ────
  //    Uses raw touch/mouse events (NOT pointer events) — most reliable
  //    on Android Chrome. start() begins recording, stop() ends it.
  //    pttStateRef guards the async getUserMedia gap (release-early).
  const handlePttDown = useCallback(async (purpose: RecordPurpose) => {
    if (pttStateRef.current !== 'idle') return;

    pttStateRef.current      = 'starting';
    recordPurposeRef.current = purpose;
    setError('');
    setMicPermissionDenied(false);

    if (purpose === 'question') {
      setTranscript('');
      setReply('');
      setAudioUrl('');
    } else {
      // Option A: voice-fill = FULL RESET. A spoken fill signals a
      // (possibly different) person on a shared phone. Wipe any
      // pre-filled localStorage data so old details never mix in.
      setForm({ name: '', dob: '', tob: '', pob: '' });
      setVoiceFilled(true);
      setFillStatus('idle');
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Browser microphone support नहीं है');
        setMicPermissionDenied(true);
        pttStateRef.current = 'idle';
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // User may have RELEASED during the await — abort cleanly.
      if (pttStateRef.current !== 'starting') {
        stream.getTracks().forEach(t => t.stop());
        pttStateRef.current = 'idle';
        return;
      }
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;
      const options: MediaRecorderOptions = { audioBitsPerSecond: 128000 };
      if (mimeType) options.mimeType = mimeType;

      const mr = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (ev) => { if (ev.data?.size > 0) chunksRef.current.push(ev.data); };

      mr.onerror = () => {
        setError('Recording failed. Please try again.');
        setRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        pttStateRef.current = 'idle';
      };

      mr.onstop = async () => {
        stopStream();
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current || 'audio/webm' });
        if (blob.size < 3000) {
          setError('Bahut chhota — button thoda zyada der dabaye rakhein aur saaf bolein.');
          if (recordPurposeRef.current === 'details') setFillStatus('idle');
          return;
        }
        if (recordPurposeRef.current === 'question') await processAudio(blob);
        else                                          await processDetailsAudio(blob);
      };

      mr.start(250);
      pttStateRef.current = 'recording';
      setRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s >= 59) {
            if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
            if (timerRef.current) clearInterval(timerRef.current);
            pttStateRef.current = 'idle';
            setRecording(false);
            return 60;
          }
          return s + 1;
        });
      }, 1000);

    } catch (err: unknown) {
      const ex = err as DOMException;
      pttStateRef.current = 'idle';
      setMicPermissionDenied(true);
      if (ex.name === 'NotAllowedError' || ex.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Browser settings में microphone Allow करें।');
      } else if (ex.name === 'NotFoundError') {
        setError('कोई microphone नहीं मिला / No microphone found');
      } else {
        setError(`Microphone error: ${ex.message || 'Unknown'}`);
      }
    }
  }, []);

  // ── PTT: touch end / mouse up → stop + submit ───────────────
  const handlePttUp = useCallback(() => {
    // Released DURING startup (before recording actually began) →
    // mark idle; the down-handler's guard will tear down the stream.
    if (pttStateRef.current === 'starting') {
      pttStateRef.current = 'idle';
      return;
    }
    if (pttStateRef.current !== 'recording') return;

    pttStateRef.current = 'idle';
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop(); // → mr.onstop → process
    }
    setRecording(false);
  }, []);

  // ── Voice-fill: STT → parse → auto-fill form ────────────────
  const processDetailsAudio = async (blob: Blob) => {
    setFillStatus('parsing');
    try {
      // 1. OpenAI STT (accurate — same engine as questions)
      const fd = new FormData();
      fd.append('audio',     blob, 'details.webm');
      fd.append('sessionId', sessionIdRef.current);
      fd.append('language',  'hinglish');

      const sttRes = await fetch('/api/voice-transcribe', { method: 'POST', body: fd });
      if (!sttRes.ok) throw new Error('Sun nahi paaye — dobara bolein');
      const sttData = await sttRes.json();
      const spoken = sttData.transcription;
      if (!spoken) throw new Error('Kuch samajh nahi aaya — dobara try karein');

      // 2. Gemini parse → structured JSON
      const parseRes = await fetch('/api/voice-parse-details', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ transcript: spoken, sessionId: sessionIdRef.current }),
      });
      if (!parseRes.ok) throw new Error('Details nikaal nahi paaye — manually bhar dein');
      const { fields, filledCount } = await parseRes.json();

      // Fields were already cleared on voice-fill start (Option A),
      // so set spoken values directly. Anything not spoken stays ''
      // — user sees the blank and fills it. NO old data carries over.
      setForm({
        name: fields.name || '',
        dob : fields.dob  || '',
        tob : fields.tob  || '',
        pob : fields.pob  || '',
      });

      setFillStatus(filledCount >= 4 ? 'done' : 'partial');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voice fill failed');
      setFillStatus('idle');
    }
  };

  // ── Process question audio (STT → Predict → TTS) ────────────
  const processAudio = async (audioBlob: Blob) => {
    setStage('processing');
    try {
      const fd = new FormData();
      fd.append('audio',     audioBlob, 'voice.webm');
      fd.append('sessionId', sessionIdRef.current);
      fd.append('language',  'hinglish');

      const sttRes = await fetch('/api/voice-transcribe', { method: 'POST', body: fd });
      if (!sttRes.ok) {
        const d = await sttRes.json().catch(() => ({}));
        throw new Error(d.error || 'Transcription failed');
      }
      const sttData = await sttRes.json();
      const userQuestion = sttData.transcription;
      if (!userQuestion) throw new Error('Could not understand audio. Please speak clearly.');
      setTranscript(userQuestion);

      const bd = formRef.current;   // latest form (not stale state)
      const chatRes = await fetch('/api/voice-predict', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Vedic-Engine': 'Rohiit-Gupta-Vedic-Engine-v2' },
        body   : JSON.stringify({
          message  : userQuestion,
          mode     : 'voice',
          userName : bd.name,
          birthData: { name: bd.name, dob: bd.dob, tob: bd.tob, pob: bd.pob },
          sessionId: sessionIdRef.current,
        }),
      });
      if (!chatRes.ok) throw new Error('Prediction failed');
      const chatData    = await chatRes.json();
      const trikalReply = chatData.prediction || chatData.reply || chatData.text || '';
      if (!trikalReply) throw new Error('Empty prediction');
      setReply(trikalReply);

      const ttsRes = await fetch('/api/voice-tts', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ text: trikalReply, sessionId: sessionIdRef.current, packId: activePackRef.current?.id || 'p11' }),
      });
      let finalAudioUrl = '';
      if (ttsRes.ok) {
        const b = await ttsRes.blob();
        finalAudioUrl = URL.createObjectURL(b);
        setAudioUrl(finalAudioUrl);
      }

      await fetch('/api/voice-pack-order', {
        method : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ sessionId: sessionIdRef.current, action: 'consume' }),
      });
      const newBal = Math.max(0, balanceRef.current - 1);
      setBalance(newBal);
      localStorage.setItem('trikal_voice_balance', String(newBal));

      setStage('reply');
      if (finalAudioUrl) setTimeout(() => { new Audio(finalAudioUrl).play().catch(() => {}); }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStage('record');
    }
  };

  // ── Payment ──────────────────────────────────────────────────
  // v1.1 — international. Razorpay on this account rejects foreign cards.
  // `?intl=1` forces the PayPal view for testing from India; one-way only.
  const [isIndia, setIsIndia] = useState<boolean | null>(null);
  const [selectedIntlPack, setSelectedIntlPack] = useState<Pack | null>(null);
  // v3.3 — in-flight lock. Holds the pack id being bought, or null.
  // Without this, every extra tap minted another Razorpay order and another
  // pending row in voice_packs. Ref as well as state: the state drives the
  // disabled button, the ref closes the gap before React re-renders.
  const [buying, setBuying] = useState<string | null>(null);
  const buyingRef = useRef<string | null>(null);
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

  /** Everything after the money is taken — shared by both payment paths. */
  const activatePack = async (pack: Pack, proof: Record<string, string>) => {
    // v3.3 — the money is ALREADY taken by the time we get here. A single
    // dropped fetch used to end the story: pack never activated, user charged.
    // Three attempts, backing off, before we give up and tell them to contact
    // support. A server-side 4xx is a real rejection and is not retried.
    let verifyRes: Response | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        verifyRes = await fetch('/api/verify-voice-pack', {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ ...proof, packId: pack.id, sessionId: sessionIdRef.current }),
        });
        if (verifyRes.ok) break;
        if (verifyRes.status < 500) break;   // genuine rejection — retrying won't help
      } catch (e) {
        console.error(`[TrikalVoice] verify attempt ${attempt} threw:`, e);
        verifyRes = null;
      }
      if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 1500));
    }

    if (!verifyRes || !verifyRes.ok) {
      // v3.4 — log the ids only. v3.3 logged the whole `proof` object, which
      // puts razorpay_signature into the visitor's browser console for anyone
      // looking. The ids are all that is needed to reconcile.
      const payId = proof.razorpay_payment_id || proof.paypal_order_id || '';
      console.error('[TrikalVoice] verify failed after retries', {
        sessionId: sessionIdRef.current,
        pack     : pack.id,
        paymentId: payId,
        orderId  : proof.razorpay_order_id || '',
      });
      // v3.4 — the ID is now IN the message. v3.3 told the user to send a
      // payment ID they had no way of seeing.
      setError(
        'Payment ho gaya but activation atak gaya. Paisa safe hai. ' +
        (payId ? `Yeh ID WhatsApp par bhejein: ${payId}` : 'WhatsApp par message karein') +
        ' — turant activate kar denge.'
      );
      return;
    }
    const verified = await verifyRes.json();
    setBalance(verified.balance);
    setValidUntil(verified.validUntil);
    localStorage.setItem('trikal_voice_balance',     String(verified.balance));
    localStorage.setItem('trikal_voice_valid_until', verified.validUntil);
    setStage('form');
  };

  /** PayPal has taken the money. verify re-confirms with PayPal. */
  const handlePayPalPaid = async (pack: Pack, proof: { paypal_order_id: string }) => {
    setError('');
    setActivePack(pack);
    await activatePack(pack, { paypal_order_id: proof.paypal_order_id });
  };

  const handleBuyPack = async (pack: Pack) => {
    // v3.3 — one tap, one order. The ref is checked (not the state) because a
    // second tap can land before React has re-rendered the disabled button.
    if (buyingRef.current) return;
    buyingRef.current = pack.id;
    setBuying(pack.id);

    // Set by the payment.failed handler so ondismiss, which fires immediately
    // afterwards, does not paint "Payment cancelled" over the real reason.
    let failureShown = false;

    const release = () => { buyingRef.current = null; setBuying(null); };

    setError('');
    setActivePack(pack);
    try {
      const orderRes = await fetch('/api/voice-pack-order', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ packId: pack.id, sessionId: sessionIdRef.current }),
      });
      if (!orderRes.ok) throw new Error(`Order creation failed (${orderRes.status})`);
      const order = await orderRes.json();

      const rzp = new window.Razorpay({
        key        : process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount     : pack.price * 100,
        currency   : 'INR',
        name       : 'Trikaal Vaani',
        description: pack.label,
        order_id   : order.orderId,
        theme      : { color: GOLD },
        handler    : async (response: Record<string, string>) => {
          release();
          await activatePack(pack, response);
        },
        modal  : {
          ondismiss: () => {
            release();
            if (!failureShown) setError('Payment cancelled — dobara try karein.');
          },
        },
        prefill: { name: form.name },
      });

      // v3.3 — the reason the issuer gives, shown on screen. Razorpay's own
      // data for the last 30 days: 5 timeouts, 1 wrong MPIN, 1 insufficient
      // balance, 1 bank cutoff. Every one of those is recoverable if the user
      // is told what happened instead of a blank "cancelled".
      rzp.on('payment.failed', (resp: { error?: { description?: string; reason?: string } }) => {
        console.error('[TrikalVoice] Razorpay payment.failed:', resp?.error);
        failureShown = true;
        release();
        const reason = resp?.error?.description?.trim();
        setError(
          (reason && reason.length > 0
            ? reason
            : 'Payment poora nahi hua.') + ' Paisa nahi kata — dobara try karein.'
        );
      });

      rzp.open();
    } catch (e) {
      console.error('[TrikalVoice] handleBuyPack failed:', e);
      release();
      setError('Payment start nahi ho paya. Dobara try karein.');
    }
  };

  const handleOpen = () => {
    if (balance > 0 && new Date(validUntil) > new Date()) setStage('form');
    else setStage('pricing');
  };

  const handleFormSubmit = () => {
    if (!form.name || !form.dob || !form.tob || !form.pob) {
      setError('कृपया सभी details भरें / Please fill all details');
      return;
    }
    localStorage.setItem('trikal_voice_form', JSON.stringify(form));
    formRef.current = form;   // guarantee processAudio reads the confirmed form
    setError('');
    setFillStatus('idle');
    setVoiceFilled(false);
    setStage('record');
  };

  const handleAskAnother = () => {
    setTranscript(''); setReply(''); setAudioUrl(''); setError('');
    if (balance > 0) setStage('record');
    else setStage('pricing');
  };

  const handleClose = () => {
    handlePttUp();
    stopStream();
    setStage('closed');
    setError('');
    setFillStatus('idle');
    setVoiceFilled(false);
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  if (stage === 'closed') {
    return (
      <>
        <button
          onClick={handleOpen}
          aria-label="Open Trikaal Voice — Ask Vedic astrology by voice"
          className="fixed bottom-6 right-6 flex items-center"
          style={{
            zIndex      : 9998,
            gap         : 9,
            background  : `linear-gradient(135deg, ${V_DARK}, ${V_MID}, ${V_LIGHT})`,
            borderRadius: '999px',
            /* 28px circle + 9px top + 9px bottom = 46px tall */
            padding     : '9px 18px 9px 9px',
            border      : 'none',
            cursor      : 'pointer',
            /* six 5s cycles = 30s of attention, then permanently still */
            animation   : 'trikalVoiceBlink 5s ease-in-out 6',
            boxShadow   : `0 5px 20px ${V_MID}73`,
          }}
        >
          <span style={{
            width: 28, height: 28, borderRadius: '50%',
            background: BG_DARK, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flex: 'none',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={V_ICON} strokeWidth="2.4">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </span>
          <span style={{ color: ON_VIOLET, fontWeight: 700, fontSize: 13 }}>
            {TAGLINES[taglineIdx]}
          </span>
        </button>
        <style>{`
          @keyframes trikalVoiceBlink {
            0%, 86%, 100% { box-shadow: 0 5px 20px ${V_MID}73; transform: scale(1); }
            93%           { box-shadow: 0 7px 36px ${V_LIGHT};  transform: scale(1.06); }
          }
          /* Anyone who asked their system not to animate gets a still pill. */
          @media (prefers-reduced-motion: reduce) {
            @keyframes trikalVoiceBlink {
              0%, 100% { box-shadow: 0 5px 20px ${V_MID}73; transform: none; }
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Trikaal Voice Prediction"
      className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ zIndex: 99999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{
          background: BG_CARD,
          border    : `1px solid ${GOLD}55`,
          boxShadow : `0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px ${GOLD}33`,
          maxHeight : '95vh',
          overflowY : 'auto',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${GOLD}22` }}>
          <div>
            <h2 style={{ color: GOLD, fontSize: 18, fontWeight: 700, margin: 0 }}>त्रिकाल वाणी</h2>
            <p style={{ color: '#aaa', fontSize: 11, margin: 0 }}>Voice Prediction by Trikaal</p>
          </div>
          <button onClick={handleClose} aria-label="Close" style={{ background: 'transparent', color: GOLD, fontSize: 28, cursor: 'pointer', border: 'none', padding: 0, lineHeight: 1 }}>×</button>
        </div>

        <div className="px-5 py-5">

          {/* ── PRICING ── */}
          {stage === 'pricing' && (
            <>
              <p style={{ color: '#fff', fontSize: 14, lineHeight: 1.6, marginBottom: 14 }}>
                {isIndia === false
                  ? 'Ask Trikaal in your own voice from $1 — and hear the answer in Trikaal\u2019s voice.'
                  : '\u20B911 में अपनी आवाज़ से सवाल पूछें — Trikaal अपनी आवाज़ में जवाब देंगे।'}
              </p>
              {isIndia === null ? (
                // v3.4 — geo not answered yet. Until 3.3 this fell through to
                // the RUPEE branch, because `null === false` is false. On a
                // slow connection a foreign visitor could tap a rupee pack and
                // hit Razorpay's "International cards are not supported".
                // /api/geo is fired when the widget mounts (it is in
                // app/layout.tsx, so that is page load) and normally resolves
                // long before anyone reaches this screen — this is insurance,
                // not a hot path.
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 10, padding: '28px 0',
                }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    border: `2px solid ${GOLD}33`, borderTopColor: GOLD,
                    animation: 'trikalGeoSpin 0.8s linear infinite',
                  }} />
                  <div style={{ color: '#888', fontSize: 12 }}>Loading…</div>
                  <style>{`
                    @keyframes trikalGeoSpin { to { transform: rotate(360deg); } }
                  `}</style>
                </div>
              ) : isIndia === false ? (
                // International: pick a pack, then pay in dollars. The pack has
                // to be chosen BEFORE the buttons render, because the PayPal
                // order is created for one specific pack.
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {PACKS.map(pack => (
                    <div key={pack.id}
                      style={{
                        background  : selectedIntlPack?.id === pack.id
                          ? `linear-gradient(135deg, ${GOLD_DARK}44, ${GOLD}22)`
                          : `linear-gradient(135deg, ${GOLD_DARK}22, ${GOLD}11)`,
                        border      : `1px solid ${GOLD}${selectedIntlPack?.id === pack.id ? 'cc' : '55'}`,
                        borderRadius: 12,
                        padding     : '14px 16px',
                        color       : '#fff',
                      }}>
                      <button
                        onClick={() => setSelectedIntlPack(pack)}
                        style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', width: '100%', cursor: 'pointer', color: '#fff' }}>
                        <div style={{ color: GOLD, fontSize: 16, fontWeight: 700 }}>{pack.usdName}</div>
                        <div style={{ color: '#bbb', fontSize: 12, marginTop: 2 }}>{pack.sub}</div>
                      </button>
                      {selectedIntlPack?.id === pack.id && (
                        <div style={{ marginTop: 12 }}>
                          <PayPalCheckout
                            productKey={pack.id === 'p11' ? 'voice' : pack.id === 'p51' ? 'voice_5q' : 'voice_12q'}
                            createOrderUrl="/api/voice-pack-order"
                            createOrderBody={{ packId: pack.id, sessionId: sessionIdRef.current }}
                            onPaid={(proof) => handlePayPalPaid(pack, { paypal_order_id: proof.paypal_order_id })}
                            onError={(m) => setError(m)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {PACKS.map(pack => (
                    <button
                      key={pack.id}
                      onClick={() => handleBuyPack(pack)}
                      // v3.3 — while ANY pack is being bought every pack button
                      // is dead. This, plus the "Opening…" label, is the fix for
                      // the duplicate Razorpay orders.
                      disabled={buying !== null}
                      style={{
                        background  : `linear-gradient(135deg, ${GOLD_DARK}22, ${GOLD}11)`,
                        border      : `1px solid ${GOLD}55`,
                        borderRadius: 12,
                        padding     : '14px 16px',
                        textAlign   : 'left',
                        cursor      : buying !== null ? 'not-allowed' : 'pointer',
                        color       : '#fff',
                        opacity     : buying !== null && buying !== pack.id ? 0.45 : 1,
                        transition  : 'opacity .15s ease',
                      }}
                    >
                      <div style={{ color: GOLD, fontSize: 16, fontWeight: 700 }}>
                        {buying === pack.id ? 'Opening…' : pack.label}
                      </div>
                      <div style={{ color: '#bbb', fontSize: 12, marginTop: 2 }}>
                        {buying === pack.id ? 'Payment window khul raha hai' : pack.sub}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <p style={{ color: '#777', fontSize: 11, textAlign: 'center', marginTop: 14 }}>
                {isIndia === false
                  ? '100% secure • PayPal, or pay by card without a PayPal account • By Rohiit Gupta, Chief Vedic Architect'
                  : '100% secure • Razorpay • By Rohiit Gupta, Chief Vedic Architect'}
              </p>
              {error && <p style={errorStyle}>{error}</p>}
            </>
          )}

          {/* ── FORM (with voice-fill) ── */}
          {stage === 'form' && (
            <>
              <p style={{ color: '#fff', fontSize: 13, marginBottom: 12 }}>
                Trikaal को आपकी जन्म details चाहिए — accuracy के लिए।
                {balance > 0 && (
                  <span style={{ color: GOLD, fontSize: 12, display: 'block', marginTop: 4 }}>
                    Balance: {balance} question{balance > 1 ? 's' : ''} remaining
                  </span>
                )}
              </p>

              {/* Voice-fill card */}
              <div style={{
                background  : `linear-gradient(135deg, ${GOLD_DARK}1a, ${GOLD}0d)`,
                border      : `1px dashed ${GOLD}66`,
                borderRadius: 12,
                padding     : '14px',
                marginBottom: 16,
                textAlign   : 'center',
              }}>
                {/* Instructional text — switches by state, but the BUTTON below stays mounted */}
                {!recording && fillStatus !== 'parsing' && (
                  <>
                    <p style={{ color: GOLD, fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                      🎙️ टाइप नहीं करना? बोलकर भरें
                    </p>
                    <p style={{ color: '#aaa', fontSize: 11, marginBottom: 12 }}>
                      Button दबाकर रखें और बोलें: नाम, जन्म तारीख, समय, और जगह
                    </p>
                  </>
                )}
                {recording && recordPurposeRef.current === 'details' && (
                  <p style={{ color: GOLD, fontSize: 13, marginBottom: 12, animation: 'trikalFade 1.5s ease-in-out infinite' }}>
                    🎙️ सुन रहे हैं... बोलते रहें ({String(seconds).padStart(2, '0')}s)
                  </p>
                )}

                {/* SINGLE persistent button — never unmounts while held,
                    so touch start/end fire on the same element reliably. */}
                {fillStatus !== 'parsing' && (
                  <button
                    onTouchStart={(e) => { e.preventDefault(); handlePttDown('details'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handlePttUp(); }}
                    onTouchCancel={(e) => { e.preventDefault(); handlePttUp(); }}
                    onMouseDown={() => handlePttDown('details')}
                    onMouseUp={() => handlePttUp()}
                    onMouseLeave={() => { if (pttStateRef.current === 'recording') handlePttUp(); }}
                    onContextMenu={(e) => e.preventDefault()}
                    aria-label={recording ? 'Release to fill details' : 'Hold to speak your birth details'}
                    style={{
                      width: 64, height: 64, borderRadius: '50%', margin: '0 auto',
                      background: (recording && recordPurposeRef.current === 'details')
                        ? 'radial-gradient(circle, #c0392b, #922b21)'
                        : `radial-gradient(circle, ${GOLD}, ${GOLD_DARK})`,
                      border: (recording && recordPurposeRef.current === 'details')
                        ? '3px solid #e74c3c'
                        : `3px solid ${GOLD_LIGHT}`,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: (recording && recordPurposeRef.current === 'details')
                        ? '0 0 0 8px rgba(192,57,43,0.25)'
                        : `0 0 0 5px ${GOLD}22`,
                      animation: (recording && recordPurposeRef.current === 'details')
                        ? 'trikalPulseRed 0.8s ease-in-out infinite' : 'none',
                      userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none',
                    }}
                  >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                      stroke={(recording && recordPurposeRef.current === 'details') ? '#fff' : BG_DARK}
                      strokeWidth="2.2" style={{ pointerEvents: 'none' }}>
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  </button>
                )}

                {!recording && fillStatus !== 'parsing' && (
                  <p style={{ color: '#666', fontSize: 10, marginTop: 8 }}>
                    e.g. &quot;मेरा नाम रोहित है, 15 अगस्त 1990, सुबह साढ़े पाँच बजे, दिल्ली&quot;
                  </p>
                )}
                {recording && recordPurposeRef.current === 'details' && (
                  <p style={{ color: '#888', fontSize: 10, marginTop: 8 }}>Release करें जब बोल चुकें</p>
                )}

                {fillStatus === 'parsing' && (
                  <div style={{ padding: '8px 0' }}>
                    <div style={{ width: 32, height: 32, margin: 'auto', border: `3px solid ${GOLD}33`, borderTopColor: GOLD, borderRadius: '50%', animation: 'trikalSpin 1s linear infinite' }} />
                    <p style={{ color: '#fff', fontSize: 12, marginTop: 10 }}>Details समझ रहे हैं...</p>
                  </div>
                )}

                {fillStatus === 'done' && (
                  <p style={{ color: '#2ecc71', fontSize: 12, fontWeight: 600 }}>
                    ✓ भर दिया — नीचे check करें और ज़रूरत हो तो ठीक करें
                  </p>
                )}
                {fillStatus === 'partial' && (
                  <p style={{ color: GOLD, fontSize: 12, fontWeight: 600 }}>
                    कुछ details भर दीं — बाकी नीचे खुद भरें या दोबारा बोलें
                  </p>
                )}
              </div>

              {/* Manual / verify form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Your Name / आपका नाम</label>
                  <input type="text" placeholder="e.g. Rohit Gupta" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Date of Birth / जन्म तिथि</label>
                  <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Time of Birth / जन्म समय</label>
                  <input type="time" value={form.tob} onChange={e => setForm({ ...form, tob: e.target.value })} style={inputStyle} />
                  <span style={hintStyle}>Approx time also OK / लगभग समय भी ठीक है</span>
                </div>
                <div>
                  <label style={labelStyle}>Place of Birth / जन्म स्थान</label>
                  <input type="text" placeholder="e.g. Delhi, India" value={form.pob} onChange={e => setForm({ ...form, pob: e.target.value })} style={inputStyle} />
                </div>
                {voiceFilled && (
                  <p style={{ color: GOLD, fontSize: 11, textAlign: 'center', lineHeight: 1.5, marginTop: 2 }}>
                    ⚠️ Confirm karein: ye details <strong>aapki apni</strong> hain?
                    <br/>
                    <span style={{ color: '#999' }}>Galat janm-details = galat bhavishyavani.</span>
                  </p>
                )}
                <button onClick={handleFormSubmit} style={primaryBtnStyle}>Continue → Record</button>
                {error && <p style={errorStyle}>{error}</p>}
              </div>
            </>
          )}

          {/* ── RECORD — question PTT ── */}
          {stage === 'record' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>

              {!recording && !micPermissionDenied && (
                <>
                  <p style={{ color: '#ccc', fontSize: 13, marginBottom: 4 }}>
                    नीचे button को <strong style={{ color: GOLD }}>दबाकर रखें</strong> और बोलते रहें
                  </p>
                  <p style={{ color: '#888', fontSize: 11, marginBottom: 6 }}>
                    Hold the button while speaking — release to submit
                  </p>
                  <p style={{ color: '#666', fontSize: 10, marginBottom: 22 }}>
                    (जैसे WhatsApp voice message)
                  </p>
                </>
              )}

              {recording && recordPurposeRef.current === 'question' && (
                <>
                  <p style={{ color: GOLD, fontSize: 13, marginBottom: 6, animation: 'trikalFade 1.5s ease-in-out infinite' }}>
                    🎙️ Trikaal सुन रहे हैं... बोलते रहें
                  </p>
                  <p style={{ color: '#888', fontSize: 11, marginBottom: 10 }}>Release button when done</p>
                  <div style={{ fontSize: 44, fontWeight: 700, color: GOLD, fontVariantNumeric: 'tabular-nums', marginBottom: 20 }}>
                    {String(seconds).padStart(2, '0')}s
                  </div>
                </>
              )}

              {!micPermissionDenied && (
                <button
                  onTouchStart={(e) => { e.preventDefault(); handlePttDown('question'); }}
                  onTouchEnd={(e) => { e.preventDefault(); handlePttUp(); }}
                  onTouchCancel={(e) => { e.preventDefault(); handlePttUp(); }}
                  onMouseDown={() => handlePttDown('question')}
                  onMouseUp={() => handlePttUp()}
                  onMouseLeave={() => { if (pttStateRef.current === 'recording') handlePttUp(); }}
                  onContextMenu={(e) => e.preventDefault()}
                  aria-label={recording ? 'Release to submit' : 'Hold to record'}
                  style={{
                    width: 104, height: 104, borderRadius: '50%', cursor: 'pointer',
                    background: recording
                      ? 'radial-gradient(circle, #c0392b, #922b21)'
                      : `radial-gradient(circle, ${GOLD}, ${GOLD_DARK})`,
                    border: recording ? '4px solid #e74c3c' : `4px solid ${GOLD_LIGHT}`,
                    boxShadow: recording
                      ? '0 0 0 10px rgba(192,57,43,0.25), 0 8px 32px rgba(192,57,43,0.4)'
                      : `0 0 0 8px ${GOLD}22, 0 8px 32px ${GOLD_DARK}66`,
                    animation: recording ? 'trikalPulseRed 0.8s ease-in-out infinite' : 'trikalPulse 2s ease-in-out infinite',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                    userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none',
                    transition: 'background 0.15s ease, border 0.15s ease',
                  }}
                >
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke={recording ? '#fff' : BG_DARK} strokeWidth="2.2" style={{ pointerEvents: 'none' }}>
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8"  y1="23" x2="16" y2="23"/>
                  </svg>
                </button>
              )}

              <p style={{ color: '#555', fontSize: 10, marginTop: 16 }}>Max 60 seconds</p>

              {micPermissionDenied && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid #e74c3c44', borderRadius: 8, padding: 14, marginBottom: 14 }}>
                    <p style={{ color: '#e74c3c', fontSize: 13, margin: 0 }}>{error}</p>
                  </div>
                  <p style={{ color: '#bbb', fontSize: 12, marginBottom: 14 }}>
                    Address bar के बगल में 🔒 tap करें → Site Settings → Microphone → Allow
                  </p>
                  <button onClick={() => { setMicPermissionDenied(false); setError(''); }} style={primaryBtnStyle}>Try Again</button>
                </div>
              )}

              {error && !micPermissionDenied && <p style={errorStyle}>{error}</p>}
            </div>
          )}

          {/* ── PROCESSING ── */}
          {stage === 'processing' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: 56, height: 56, margin: 'auto', border: `3px solid ${GOLD}33`, borderTopColor: GOLD, borderRadius: '50%', animation: 'trikalSpin 1s linear infinite' }} />
              <p style={{ color: '#fff', fontSize: 13, marginTop: 18 }}>Trikaal आपके सवाल पर ध्यान कर रहे हैं...</p>
              {transcript && <p style={{ color: '#888', fontSize: 11, marginTop: 12, fontStyle: 'italic' }}>&quot;{transcript}&quot;</p>}
            </div>
          )}

          {/* ── REPLY ── */}
          {stage === 'reply' && (
            <>
              {transcript && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>आपका सवाल</div>
                  <div style={{ color: '#bbb', fontSize: 13, marginTop: 4, fontStyle: 'italic' }}>&quot;{transcript}&quot;</div>
                </div>
              )}
              <div style={{ borderTop: `1px solid ${GOLD}33`, paddingTop: 14 }}>
                <div style={{ color: GOLD, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>त्रिकाल का उत्तर</div>
                <p style={{ color: '#fff', fontSize: 14, lineHeight: 1.7 }}>{reply}</p>
              </div>
              {audioUrl && <audio controls src={audioUrl} style={{ width: '100%', marginTop: 14 }} />}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={handleAskAnother} style={{ ...primaryBtnStyle, flex: 1 }}>
                  {balance > 0 ? `Ask Another (${balance} left)` : 'Buy More Questions'}
                </button>
                <button onClick={handleClose} style={{ ...secondaryBtnStyle, flex: 1 }}>Close</button>
              </div>
            </>
          )}

        </div>
      </div>

      <style>{`
        @keyframes trikalPulse {
          0%, 100% { box-shadow: 0 0 0 8px ${GOLD}22, 0 8px 32px ${GOLD_DARK}66; }
          50%      { box-shadow: 0 0 0 18px ${GOLD}00, 0 8px 32px ${GOLD_DARK}66; }
        }
        @keyframes trikalPulseRed {
          0%, 100% { box-shadow: 0 0 0 10px rgba(192,57,43,0.25), 0 8px 32px rgba(192,57,43,0.4); }
          50%      { box-shadow: 0 0 0 22px rgba(192,57,43,0),    0 8px 32px rgba(192,57,43,0.4); }
        }
        @keyframes trikalFade {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }
        @keyframes trikalSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', color: GOLD, fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: 0.3,
};
const hintStyle: React.CSSProperties = {
  display: 'block', color: '#777', fontSize: 10, marginTop: 4, fontStyle: 'italic',
};
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.05)', border: `1px solid ${GOLD}33`,
  color: '#fff', padding: '11px 14px', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box',
};
const primaryBtnStyle: React.CSSProperties = {
  background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`, color: BG_DARK, border: 'none',
  padding: '12px 18px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%',
};
const secondaryBtnStyle: React.CSSProperties = {
  background: 'transparent', color: GOLD, border: `1px solid ${GOLD}66`,
  padding: '12px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
};
const errorStyle: React.CSSProperties = {
  color: '#e74c3c', fontSize: 12, marginTop: 12, padding: 10,
  background: 'rgba(231,76,60,0.1)', border: '1px solid #e74c3c44', borderRadius: 6,
};
