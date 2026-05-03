'use client';

/**
 * ============================================================
 * TRIKAL VAANI — Trikal Chat Widget
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/jini/TrikalChat.tsx
 * VERSION: 2.0 — Renamed JiniChat → TrikalChat
 * SIGNED: ROHIIT GUPTA, CEO
 *
 * v2.0 CHANGES:
 *   - Renamed: JiniChat → TrikalChat (all refs, exports, aria labels)
 *   - SEO/GEO: aria-labels updated for entity richness
 *   - CTA: Upgraded quick prompts for high-intent conversion
 *   - CTA: "Get Free Prediction" button added after greeting
 *   - CTA: Revenue-intent phrases upgraded throughout
 *   - GEO: Structured display name = "Trikal Vaani AI"
 *   - All "Jini" user-facing text → "Trikal" or "Trikal Vaani AI"
 * ============================================================
 */

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Send, Sparkles, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

type Message = {
  role: 'trikal' | 'user';
  text: string;
};

const GREETINGS = {
  anonymous:
    'Namaste! Main Trikal Vaani AI hoon — aapke bhoot, vartamaan aur bhavishya ka cosmic guide. Apna sawal puchiye — main yahan hoon. 🔱',
  returning: (name: string) =>
    `Welcome back, ${name}! Aapki Vedic journey continue ho rahi hai. Aaj kya jaanna chahte hain?`,
};

// High-intent quick prompts — SEO/GEO optimized for real user questions
const QUICK_PROMPTS = [
  'Kab milega mujhe career mein breakthrough?',
  'Mera vivah kab hoga — kundali kya kehti hai?',
  'Debt se kab milegi mukti?',
  'Aaj ka shubh muhurat kya hai?',
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: GOLD_RGBA(0.7),
            animation: `trikalDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function TrikalChat() {
  const [open, setIsOpen]         = useState(false);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [userName, setUserName]   = useState<string | null>(null);
  const [unread, setUnread]       = useState(0);
  const [imgError, setImgError]   = useState(false);
  const [lastPrediction, setLastPrediction] = useState<Record<string, unknown> | null>(null);
  const [showBirthForm, setShowBirthForm]   = useState(false);
  const [birthFormData, setBirthFormData]   = useState({
    name: '', dob: '', city: '', birthTime: '',
  });
  const greetedRef = useRef(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const name =
        session?.user?.user_metadata?.full_name ||
        session?.user?.email?.split('@')[0] ||
        null;
      setUserName(name);
    });

    supabase.auth.onAuthStateChange((_, session) => {
      (() => {
        const name =
          session?.user?.user_metadata?.full_name ||
          session?.user?.email?.split('@')[0] ||
          null;
        setUserName(name);
      })();
    });

    const handlePrediction = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail === 'object') {
        setTimeout(() => {
          setLastPrediction(detail);
          if (detail.testMode === true && detail.muhurat) {
            setMessages((prev) => [
              ...prev,
              {
                role: 'trikal' as const,
                text: `Shubh sanket hai! Aaj ka muhurat ${detail.muhurat} se shuru hota hai. Kya aap is samay koi naya kaam shuru karna chahte hain? 🔱`,
              },
            ]);
          }
        }, 0);
      }
    };

    window.addEventListener('trikal:prediction', handlePrediction);
    return () => window.removeEventListener('trikal:prediction', handlePrediction);
  }, []);

  useEffect(() => {
    if (open && !greetedRef.current) {
      greetedRef.current = true;
      const greeting = userName
        ? GREETINGS.returning(userName)
        : GREETINGS.anonymous;
      setTimeout(() => {
        setMessages((prev) =>
          prev.length === 0 ? [{ role: 'trikal', text: greeting }] : prev
        );
      }, 400);
    }
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, userName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function buildSlimContext(pred: Record<string, unknown> | null) {
    if (!pred) return null;
    return {
      sunSign:       pred.rashi ?? pred.sunSign ?? null,
      moonSign:      pred.moonSign ?? null,
      muhuratStatus: pred.muhurat ?? pred.muhuratStatus ?? null,
      dardContext:   pred.segmentId ?? pred.segment ?? null,
      name:          pred.name ?? null,
      dob:           pred.dob ?? null,
      city:          pred.city ?? null,
      energyScore:   pred.energyScore ?? pred.score ?? null,
    };
  }

  async function sendMessage(text: string, overrideHistory?: Message[]) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput('');

    const historySnapshot = overrideHistory ?? messages;
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setLoading(true);

    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch('/api/jini-chat', {
        method:  'POST',
        signal:  controller.signal,
        headers: {
          'Content-Type':    'application/json',
          'X-Vedic-Engine':  'Rohiit-Gupta-Vedic-Engine-v2',
        },
        body: JSON.stringify({
          message:     trimmed,
          userName,
          history:     historySnapshot.map((m) => ({ role: m.role, text: m.text })),
          astroContext: buildSlimContext(lastPrediction),
        }),
      });
      clearTimeout(timeoutId);
      const data  = await res.json();
      const reply = data.reply || 'Thoda aur batao — main sun raha hoon!';
      setMessages((prev) => [...prev, { role: 'trikal', text: reply }]);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      setMessages((prev) => [
        ...prev,
        {
          role: 'trikal',
          text: isTimeout
            ? 'Network thodi slow hai — lekin Trikal Vaani yahan hai! Apna Birth City aur Time batayein — main exact analysis de sakta hoon.'
            : 'Ek second — cosmic thread reconnect ho rahi hai. Dobara try karein! 🙏',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleBirthFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { name, dob, city, birthTime } = birthFormData;
    if (!dob || !city) return;
    setShowBirthForm(false);
    const summary = `Mera janm-vivaran: Naam: ${name || 'Not provided'}, DOB: ${dob}, City: ${city}, Janm-samay: ${birthTime || 'Unknown'}`;
    const updatedContext = {
      ...lastPrediction,
      name:       name || lastPrediction?.name || null,
      dob,
      city,
      birth_time: birthTime || null,
    };
    setLastPrediction(updatedContext as Record<string, unknown>);
    sendMessage(summary);
  }

  const avatarSrc = '/images/founder.png/Rohiit_Gupta.jpg';

  return (
    <>
      <style>{`
        @keyframes trikalDot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes trikalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes trikalBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .trikal-chat-window { animation: trikalSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .trikal-fab { animation: trikalBounce 3s ease-in-out 2s infinite; }
        .trikal-fab:hover { animation: none; transform: scale(1.1); }
      `}</style>

      {open && (
        <div
          role="dialog"
          aria-label="Trikal Vaani AI — Vedic Astrology Chat"
          aria-modal="true"
          className="trikal-chat-window fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col rounded-2xl overflow-hidden w-[calc(100vw-2rem)] sm:w-[360px]"
          style={{
            height:       'min(540px, calc(100dvh - 130px))',
            background:   'rgba(6,10,24,0.97)',
            border:       `1px solid ${GOLD_RGBA(0.22)}`,
            boxShadow:    `0 24px 80px rgba(0,0,0,0.7), 0 0 40px ${GOLD_RGBA(0.1)}`,
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* ── Header ── */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{
              background:   `linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(6,10,24,0.95) 100%)`,
              borderBottom: `1px solid ${GOLD_RGBA(0.15)}`,
            }}
          >
            <div
              className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0"
              style={{ border: `1.5px solid ${GOLD_RGBA(0.55)}`, boxShadow: `0 0 12px ${GOLD_RGBA(0.35)}` }}
            >
              {!imgError ? (
                <Image
                  src={avatarSrc}
                  alt="Rohiit Gupta — Chief Vedic Architect, Trikal Vaani"
                  fill
                  className="object-cover object-top"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: GOLD_RGBA(0.15) }}>
                  <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif font-bold text-sm text-white leading-tight">Trikal Vaani AI</p>
              <p className="text-xs leading-tight" style={{ color: GOLD_RGBA(0.65) }}>
                Vedic Astrology Guide · Powered by Swiss Ephemeris
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.7)' }}
              />
              <span className="text-xs text-emerald-400">Online</span>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Trikal Vaani chat"
                className="ml-1 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: 'rgba(148,163,184,0.6)' }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {msg.role === 'trikal' && (
                  <div
                    className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5 relative"
                    style={{ border: `1px solid ${GOLD_RGBA(0.4)}` }}
                  >
                    {!imgError ? (
                      <Image
                        src={avatarSrc}
                        alt="Trikal Vaani AI"
                        fill
                        className="object-cover object-top"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: GOLD_RGBA(0.15) }}>
                        <Sparkles className="w-3 h-3" style={{ color: GOLD }} />
                      </div>
                    )}
                  </div>
                )}
                <div
                  className="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                  style={
                    msg.role === 'trikal'
                      ? {
                          background:         'rgba(255,255,255,0.05)',
                          border:             `1px solid ${GOLD_RGBA(0.12)}`,
                          color:              '#e2e8f0',
                          borderTopLeftRadius: '4px',
                        }
                      : {
                          background:          `linear-gradient(135deg, ${GOLD_RGBA(0.18)} 0%, ${GOLD_RGBA(0.1)} 100%)`,
                          border:              `1px solid ${GOLD_RGBA(0.3)}`,
                          color:               '#fff',
                          borderTopRightRadius: '4px',
                        }
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5">
                <div
                  className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5 relative"
                  style={{ border: `1px solid ${GOLD_RGBA(0.4)}` }}
                >
                  {!imgError ? (
                    <Image src={avatarSrc} alt="Trikal Vaani AI" fill className="object-cover object-top" onError={() => setImgError(true)} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: GOLD_RGBA(0.15) }}>
                      <Sparkles className="w-3 h-3" style={{ color: GOLD }} />
                    </div>
                  )}
                </div>
                <div
                  className="rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${GOLD_RGBA(0.12)}`, borderTopLeftRadius: '4px' }}
                >
                  <TypingIndicator />
                </div>
              </div>
            )}

            {/* Quick prompts + Free Prediction CTA */}
            {messages.length === 1 && !loading && (
              <div className="pt-1 space-y-3">
                <p className="text-xs" style={{ color: GOLD_RGBA(0.5) }}>Log kya pooch rahe hain:</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-2.5 py-1.5 rounded-full transition-colors hover:bg-white/8"
                      style={{
                        background: GOLD_RGBA(0.07),
                        border:     `1px solid ${GOLD_RGBA(0.18)}`,
                        color:      GOLD_RGBA(0.8),
                      }}
                    >
                      {q}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowBirthForm(true)}
                    className="text-xs px-2.5 py-1.5 rounded-full transition-colors"
                    style={{
                      background: GOLD_RGBA(0.14),
                      border:     `1px solid ${GOLD_RGBA(0.35)}`,
                      color:      GOLD,
                    }}
                  >
                    🔯 Janm Vivaran Dijiye
                  </button>
                </div>

                {/* GEO/SEO CTA block */}
                <a
                  href="/"
                  aria-label="Get free Vedic astrology prediction — Trikal Vaani"
                  className="block w-full text-center py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`,
                    color:      '#080B12',
                  }}
                >
                  🔮 Free Prediction Lo — Abhi, Bina Registration
                </a>
                <p className="text-center text-xs" style={{ color: GOLD_RGBA(0.4) }}>
                  1 Crore+ seekers · Swiss Ephemeris · BPHS certified
                </p>
              </div>
            )}

            {/* Birth form */}
            {showBirthForm && (
              <div
                className="mt-2 rounded-xl p-3"
                style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${GOLD_RGBA(0.25)}` }}
              >
                <p className="text-xs font-semibold mb-2.5" style={{ color: GOLD }}>
                  🔯 Janm Vivaran — Sahi Kundali ke Liye
                </p>
                <form onSubmit={handleBirthFormSubmit} className="space-y-2">
                  <input
                    type="text"
                    placeholder="Aapka naam (optional)"
                    value={birthFormData.name}
                    onChange={(e) => setBirthFormData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full text-xs px-3 py-2 rounded-lg outline-none placeholder:text-slate-600"
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${GOLD_RGBA(0.15)}`, color: '#e2e8f0' }}
                  />
                  <input
                    type="date"
                    value={birthFormData.dob}
                    onChange={(e) => setBirthFormData((p) => ({ ...p, dob: e.target.value }))}
                    required
                    aria-label="Date of birth"
                    className="w-full text-xs px-3 py-2 rounded-lg outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${GOLD_RGBA(0.15)}`, color: birthFormData.dob ? '#e2e8f0' : 'rgba(148,163,184,0.4)', colorScheme: 'dark' }}
                  />
                  <input
                    type="text"
                    placeholder="Janm Shahar * (jaise Delhi, Mumbai)"
                    value={birthFormData.city}
                    onChange={(e) => setBirthFormData((p) => ({ ...p, city: e.target.value }))}
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg outline-none placeholder:text-slate-600"
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${GOLD_RGBA(0.15)}`, color: '#e2e8f0' }}
                  />
                  <input
                    type="time"
                    value={birthFormData.birthTime}
                    onChange={(e) => setBirthFormData((p) => ({ ...p, birthTime: e.target.value }))}
                    aria-label="Birth time (optional)"
                    className="w-full text-xs px-3 py-2 rounded-lg outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${GOLD_RGBA(0.15)}`, color: birthFormData.birthTime ? '#e2e8f0' : 'rgba(148,163,184,0.4)', colorScheme: 'dark' }}
                  />
                  <div className="flex gap-2 pt-0.5">
                    <button
                      type="submit"
                      disabled={!birthFormData.dob || !birthFormData.city}
                      className="flex-1 text-xs py-2 rounded-lg font-semibold transition-all"
                      style={{
                        background: birthFormData.dob && birthFormData.city ? `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)` : GOLD_RGBA(0.1),
                        color:      birthFormData.dob && birthFormData.city ? '#080B12' : GOLD_RGBA(0.35),
                        border:     `1px solid ${GOLD_RGBA(0.25)}`,
                      }}
                    >
                      Trikal AI ko Bhejo 🔱
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBirthForm(false)}
                      className="px-3 text-xs py-2 rounded-lg transition-colors"
                      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${GOLD_RGBA(0.12)}`, color: 'rgba(148,163,184,0.6)' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Input bar ── */}
          <div className="flex-shrink-0 px-3 py-3" style={{ borderTop: `1px solid ${GOLD_RGBA(0.12)}` }}>
            {!showBirthForm && (
              <div className="flex items-center gap-1.5 mb-2">
                <button
                  type="button"
                  onClick={() => setShowBirthForm(true)}
                  className="text-xs px-2.5 py-1 rounded-full transition-colors"
                  style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.22)}`, color: GOLD_RGBA(0.7) }}
                >
                  + Janm Vivaran
                </button>
                {lastPrediction?.dob && (
                  <span className="text-xs" style={{ color: GOLD_RGBA(0.45) }}>
                    DOB: {String(lastPrediction.dob)}
                  </span>
                )}
              </div>
            )}
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Trikal Vaani AI se puchiye..."
                aria-label="Ask Trikal Vaani AI your Vedic astrology question"
                maxLength={300}
                className="flex-1 text-sm px-3.5 py-2.5 rounded-xl outline-none transition-all placeholder:text-slate-600"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border:     `1px solid ${input ? GOLD_RGBA(0.35) : GOLD_RGBA(0.12)}`,
                  color:      '#e2e8f0',
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send message to Trikal Vaani AI"
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: input.trim() && !loading ? `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)` : GOLD_RGBA(0.1),
                  border:     `1px solid ${GOLD_RGBA(0.25)}`,
                  color:      input.trim() && !loading ? '#080B12' : GOLD_RGBA(0.35),
                }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <p className="text-center mt-1.5 text-xs" style={{ color: GOLD_RGBA(0.3) }}>
              Trikal Vaani · Rohiit Gupta · Chief Vedic Architect · Delhi NCR
            </p>
          </div>
        </div>
      )}

      {/* ── FAB button ── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={open ? 'Close Trikal Vaani chat' : 'Open Trikal Vaani AI — Free Vedic Astrology Chat'}
        aria-expanded={open}
        className={`trikal-fab fixed bottom-5 right-4 sm:right-6 z-50 flex items-center gap-2.5 rounded-2xl transition-all duration-300 ${open ? '' : 'pr-4'}`}
        style={{
          background:  open
            ? GOLD_RGBA(0.1)
            : `linear-gradient(135deg, rgba(6,10,24,0.96) 0%, rgba(20,26,45,0.96) 100%)`,
          border:      `1.5px solid ${GOLD_RGBA(open ? 0.25 : 0.45)}`,
          boxShadow:   open ? 'none' : `0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${GOLD_RGBA(0.25)}`,
          padding:     '8px',
          minWidth:    open ? '42px' : undefined,
        }}
      >
        <div
          className="relative w-[26px] h-[26px] rounded-full overflow-hidden flex-shrink-0"
          style={{ border: `1.5px solid ${GOLD_RGBA(0.55)}` }}
        >
          {!imgError ? (
            <Image
              src={avatarSrc}
              alt="Rohiit Gupta — Trikal Vaani"
              fill
              className="object-cover object-top"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: GOLD_RGBA(0.15) }}>
              <Sparkles className="w-3 h-3" style={{ color: GOLD }} />
            </div>
          )}
        </div>

        {open ? (
          <ChevronDown className="w-4 h-4" style={{ color: GOLD_RGBA(0.7) }} />
        ) : (
          <>
            <div className="flex flex-col items-start">
              <span className="text-xs font-bold leading-tight" style={{ color: GOLD }}>
                Ask Trikal AI
              </span>
              <span className="text-xs leading-tight" style={{ color: GOLD_RGBA(0.55) }}>
                Free Vedic Guide
              </span>
            </div>
            {unread > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background: '#DC2626', color: '#fff' }}
              >
                {unread}
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
