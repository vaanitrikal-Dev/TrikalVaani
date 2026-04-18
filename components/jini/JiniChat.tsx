'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Send, Sparkles, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

type Message = {
  role: 'jini' | 'user';
  text: string;
};

const GREETINGS = {
  anonymous: 'Namaste! Main Jini hoon — Trikal Vaani ki AI soul. Aapke koi cosmic sawal hain? Puchiye, main yahan hoon.',
  returning: (name: string) =>
    `Welcome back, ${name}! Aapki cosmic journey continue ho rahi hai. Aaj kya jaanna chahte hain?`,
};

const QUICK_PROMPTS = [
  'What does my Venus placement mean?',
  'Why does my ex keep coming back?',
  'Is my current Dasha favorable?',
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
            animation: `jiniDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function JiniChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [greeted, setGreeted] = useState(false);
  const [unread, setUnread] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [lastPrediction, setLastPrediction] = useState<Record<string, unknown> | null>(null);
  const [showBirthForm, setShowBirthForm] = useState(false);
  const [birthFormData, setBirthFormData] = useState({ name: '', dob: '', city: '', birthTime: '' });
  const greetedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
                role: 'jini' as const,
                text: `Bhai, planets align ho gaye hain! Aaj ka shubh muhurat ${detail.muhurat} se hai. Kya aap is waqt koi naya kaam shuru karna chahte hain?`,
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
      setGreeted(true);
      const greeting = userName
        ? GREETINGS.returning(userName)
        : GREETINGS.anonymous;
      setTimeout(() => {
        setMessages((prev) => prev.length === 0 ? [{ role: 'jini', text: greeting }] : prev);
      }, 400);
    }
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  function buildSlimContext(pred: Record<string, unknown> | null) {
    if (!pred) return null;
    return {
      sunSign: pred.rashi ?? pred.sunSign ?? null,
      moonSign: pred.moonSign ?? null,
      muhuratStatus: pred.muhurat ?? pred.muhuratStatus ?? null,
      dardContext: pred.segmentId ?? pred.segment ?? null,
      name: pred.name ?? null,
      dob: pred.dob ?? null,
      city: pred.city ?? null,
      energyScore: pred.energyScore ?? pred.score ?? null,
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
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch('/api/jini-chat', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Vedic-Engine': 'Rohiit-Gupta-Vedic-Engine-v2',
        },
        body: JSON.stringify({
          message: trimmed,
          userName,
          history: historySnapshot.map((m) => ({ role: m.role, text: m.text })),
          astroContext: buildSlimContext(lastPrediction),
        }),
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      const reply = data.reply || 'Thoda aur batao — main sun rahi hoon!';
      setMessages((prev) => [...prev, { role: 'jini', text: reply }]);
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isTimeout = err instanceof Error && err.name === 'AbortError';
      setMessages((prev) => [
        ...prev,
        {
          role: 'jini',
          text: isTimeout
            ? 'Network thodi slow hai abhi — lekin main yahan hoon! Kya aap apna Birth City aur Time bata sakte hain? Ussi se main aapka exact analysis de sakti hoon.'
            : 'Ek second — cosmic thread reconnect ho rahi hai. Dobara try karein!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleBirthFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { name, dob, city, birthTime } = birthFormData;
    if (!dob || !city) return;
    setShowBirthForm(false);
    const summary = `My birth details: Name: ${name || 'Not provided'}, DOB: ${dob}, City: ${city}, Birth Time: ${birthTime || 'Unknown'}`;
    const updatedContext = {
      ...lastPrediction,
      name: name || lastPrediction?.name || null,
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
        @keyframes jiniDot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes jiniSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes jiniBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .jini-chat-window { animation: jiniSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .jini-fab { animation: jiniBounce 3s ease-in-out 2s infinite; }
        .jini-fab:hover { animation: none; transform: scale(1.1); }
      `}</style>

      {open && (
        <div
          className="jini-chat-window fixed bottom-24 right-4 sm:right-6 z-50 flex flex-col rounded-2xl overflow-hidden w-[calc(100vw-2rem)] sm:w-[360px]"
          style={{
            height: 'min(520px, calc(100dvh - 130px))',
            background: 'rgba(6,10,24,0.97)',
            border: `1px solid ${GOLD_RGBA(0.22)}`,
            boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 40px ${GOLD_RGBA(0.1)}`,
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(6,10,24,0.95) 100%)`,
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
                  alt="Jini — Trikal Vaani AI"
                  fill
                  className="object-cover object-top"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: GOLD_RGBA(0.15) }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif font-bold text-sm text-white leading-tight">Jini</p>
              <p className="text-xs leading-tight" style={{ color: GOLD_RGBA(0.65) }}>
                Trikal Vaani AI Guide
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.7)' }}
              />
              <span className="text-xs text-emerald-400">Online</span>
              <button
                onClick={handleClose}
                className="ml-1 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: 'rgba(148,163,184,0.6)' }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {msg.role === 'jini' && (
                  <div
                    className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5 relative"
                    style={{ border: `1px solid ${GOLD_RGBA(0.4)}` }}
                  >
                    {!imgError ? (
                      <Image
                        src={avatarSrc}
                        alt="Jini"
                        fill
                        className="object-cover object-top"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: GOLD_RGBA(0.15) }}
                      >
                        <Sparkles className="w-3 h-3" style={{ color: GOLD }} />
                      </div>
                    )}
                  </div>
                )}
                <div
                  className="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                  style={
                    msg.role === 'jini'
                      ? {
                          background: 'rgba(255,255,255,0.05)',
                          border: `1px solid ${GOLD_RGBA(0.12)}`,
                          color: '#e2e8f0',
                          borderTopLeftRadius: '4px',
                        }
                      : {
                          background: `linear-gradient(135deg, ${GOLD_RGBA(0.18)} 0%, ${GOLD_RGBA(0.1)} 100%)`,
                          border: `1px solid ${GOLD_RGBA(0.3)}`,
                          color: '#fff',
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
                    <Image src={avatarSrc} alt="Jini" fill className="object-cover object-top" onError={() => setImgError(true)} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: GOLD_RGBA(0.15) }}>
                      <Sparkles className="w-3 h-3" style={{ color: GOLD }} />
                    </div>
                  )}
                </div>
                <div
                  className="rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${GOLD_RGBA(0.12)}`,
                    borderTopLeftRadius: '4px',
                  }}
                >
                  <TypingIndicator />
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="pt-1">
                <p className="text-xs mb-2" style={{ color: GOLD_RGBA(0.5) }}>Quick questions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-2.5 py-1.5 rounded-full transition-colors hover:bg-white/8"
                      style={{
                        background: GOLD_RGBA(0.07),
                        border: `1px solid ${GOLD_RGBA(0.18)}`,
                        color: GOLD_RGBA(0.8),
                      }}
                    >
                      {q}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowBirthForm(true)}
                    className="text-xs px-2.5 py-1.5 rounded-full transition-colors hover:bg-white/8"
                    style={{
                      background: GOLD_RGBA(0.14),
                      border: `1px solid ${GOLD_RGBA(0.35)}`,
                      color: GOLD,
                    }}
                  >
                    Share Birth Details
                  </button>
                </div>
              </div>
            )}

            {showBirthForm && (
              <div
                className="mt-2 rounded-xl p-3"
                style={{
                  background: 'rgba(212,175,55,0.06)',
                  border: `1px solid ${GOLD_RGBA(0.25)}`,
                }}
              >
                <p className="text-xs font-semibold mb-2.5" style={{ color: GOLD }}>
                  Birth Details — Accurate Reading ke Liye
                </p>
                <form onSubmit={handleBirthFormSubmit} className="space-y-2">
                  <input
                    type="text"
                    placeholder="Your Name (optional)"
                    value={birthFormData.name}
                    onChange={(e) => setBirthFormData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full text-xs px-3 py-2 rounded-lg outline-none placeholder:text-slate-600"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${GOLD_RGBA(0.15)}`,
                      color: '#e2e8f0',
                    }}
                  />
                  <input
                    type="date"
                    placeholder="Date of Birth *"
                    value={birthFormData.dob}
                    onChange={(e) => setBirthFormData((p) => ({ ...p, dob: e.target.value }))}
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${GOLD_RGBA(0.15)}`,
                      color: birthFormData.dob ? '#e2e8f0' : 'rgba(148,163,184,0.4)',
                      colorScheme: 'dark',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Birth City *  (e.g. Delhi, Mumbai)"
                    value={birthFormData.city}
                    onChange={(e) => setBirthFormData((p) => ({ ...p, city: e.target.value }))}
                    required
                    className="w-full text-xs px-3 py-2 rounded-lg outline-none placeholder:text-slate-600"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${GOLD_RGBA(0.15)}`,
                      color: '#e2e8f0',
                    }}
                  />
                  <input
                    type="time"
                    placeholder="Birth Time (optional)"
                    value={birthFormData.birthTime}
                    onChange={(e) => setBirthFormData((p) => ({ ...p, birthTime: e.target.value }))}
                    className="w-full text-xs px-3 py-2 rounded-lg outline-none"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${GOLD_RGBA(0.15)}`,
                      color: birthFormData.birthTime ? '#e2e8f0' : 'rgba(148,163,184,0.4)',
                      colorScheme: 'dark',
                    }}
                  />
                  <div className="flex gap-2 pt-0.5">
                    <button
                      type="submit"
                      disabled={!birthFormData.dob || !birthFormData.city}
                      className="flex-1 text-xs py-2 rounded-lg font-semibold transition-all"
                      style={{
                        background: birthFormData.dob && birthFormData.city
                          ? `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`
                          : GOLD_RGBA(0.1),
                        color: birthFormData.dob && birthFormData.city ? '#080B12' : GOLD_RGBA(0.35),
                        border: `1px solid ${GOLD_RGBA(0.25)}`,
                      }}
                    >
                      Send to Jini
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBirthForm(false)}
                      className="px-3 text-xs py-2 rounded-lg transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${GOLD_RGBA(0.12)}`,
                        color: 'rgba(148,163,184,0.6)',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div
            className="flex-shrink-0 px-3 py-3"
            style={{ borderTop: `1px solid ${GOLD_RGBA(0.12)}` }}
          >
            {!showBirthForm && (
              <div className="flex items-center gap-1.5 mb-2">
                <button
                  type="button"
                  onClick={() => setShowBirthForm(true)}
                  className="text-xs px-2.5 py-1 rounded-full transition-colors"
                  style={{
                    background: GOLD_RGBA(0.08),
                    border: `1px solid ${GOLD_RGBA(0.22)}`,
                    color: GOLD_RGBA(0.7),
                  }}
                >
                  + Birth Details
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
                placeholder="Ask Jini anything..."
                maxLength={300}
                className="flex-1 text-sm px-3.5 py-2.5 rounded-xl outline-none transition-all placeholder:text-slate-600"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${input ? GOLD_RGBA(0.35) : GOLD_RGBA(0.12)}`,
                  color: '#e2e8f0',
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: input.trim() && !loading
                    ? `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`
                    : GOLD_RGBA(0.1),
                  border: `1px solid ${GOLD_RGBA(0.25)}`,
                  color: input.trim() && !loading ? '#080B12' : GOLD_RGBA(0.35),
                }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <p className="text-center mt-1.5 text-xs" style={{ color: GOLD_RGBA(0.3) }}>
              Powered by Vedic AI — Trikal Vaani
            </p>
          </div>
        </div>
      )}

      <button
        onClick={open ? handleClose : handleOpen}
        className={`jini-fab fixed bottom-5 right-4 sm:right-6 z-50 flex items-center gap-2.5 rounded-2xl transition-all duration-300 ${open ? '' : 'pr-4'}`}
        style={{
          background: open
            ? GOLD_RGBA(0.1)
            : `linear-gradient(135deg, rgba(6,10,24,0.96) 0%, rgba(20,26,45,0.96) 100%)`,
          border: `1.5px solid ${GOLD_RGBA(open ? 0.25 : 0.45)}`,
          boxShadow: open
            ? 'none'
            : `0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${GOLD_RGBA(0.25)}`,
          padding: open ? '8px' : '8px',
          minWidth: open ? '42px' : undefined,
        }}
      >
        <div
          className="relative w-[26px] h-[26px] rounded-full overflow-hidden flex-shrink-0"
          style={{ border: `1.5px solid ${GOLD_RGBA(0.55)}` }}
        >
          {!imgError ? (
            <Image
              src={avatarSrc}
              alt="Jini"
              fill
              className="object-cover object-top"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: GOLD_RGBA(0.15) }}
            >
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
                Ask Jini
              </span>
              <span className="text-xs leading-tight" style={{ color: GOLD_RGBA(0.55) }}>
                Vedic AI Guide
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
