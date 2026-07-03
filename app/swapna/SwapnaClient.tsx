'use client';
// 🔱 TRIKAAL VAANI | app/swapna/SwapnaClient.tsx | v1.1
// v1.1: DREAM SUMMARY BOX — the free reading is now a 75–100 word Gemini
//   summary (+ closing invite), so the plain 1.4rem line became a proper
//   gold-bordered summary card ("✦ Dream Summary · स्वप्न सार") with
//   readable long-text typography. Nothing else touched — medallion,
//   paywall, form, terminal states, ₹51 integration point all unchanged.
// v1.0: Interactive dream funnel: dream box → engine (/api/dream) → result → paywall.
// Free flow is fully live. The ₹51 paid trigger is the marked integration point
// (Razorpay + Component 6 dasha overlay) — wired in the next build step.

import { useState } from 'react';

const C = {
  night: '#080B12', panel: 'rgba(11,16,26,0.7)', panel2: '#0E141F', raised: '#121826',
  gold: '#D4AF37', goldDeep: '#A8820A', goldLite: '#F0D68A', goldSoft: 'rgba(212,175,55,0.55)',
  line: 'rgba(212,175,55,0.14)', line2: 'rgba(212,175,55,0.26)',
  s3: '#CBD5E1', s4: '#94A3B8', s5: '#64748B',
};

// symbol_key → emoji (specific), with a category fallback so it always shows something
const EMOJI: Record<string, string> = {
  snake: '🐍', teeth: '🦷', flying: '🕊️', falling: '🌀', hair: '💇', blood: '🩸', naked: '🧍', chased: '🏃',
  cow: '🐄', elephant: '🐘', lion: '🦁', horse: '🐎', dog: '🐕', cat: '🐈', fish: '🐟', crow: '🐦',
  peacock: '🦚', owl: '🦉', monkey: '🐒', scorpion: '🦂', insects: '🐜',
  fire: '🔥', sun: '☀️', moon: '🌙', star: '⭐', stars: '⭐', sky: '🌌', tree: '🌳', mountain: '⛰️',
  rain: '🌧️', storm: '⛈️', rainbow: '🌈', earthquake: '🌍', eclipse: '🌑', land: '🏞️',
  gold: '🪙', money: '💰', marriage: '💍', wedding: '💍', pregnancy: '🤰', birth_omen: '👶',
  vehicle: '🚗', house: '🏠', journey: '🧳', pilgrimage: '🛕', foreign: '✈️', exam: '📜',
  makeup: '💄', exercise: '🧘', dancing: '💃', loss: '🕳️', lost: '🧭',
  water: '🌊', drowning: '🌊', river: '🏞️', flood: '🌊', sea: '🌊', well: '🪣', ganga: '🕉️',
  sweets: '🍬', sweet_food: '🍬', bitter_food: '🌿', feast: '🍽️', eating: '🍚', cooking: '🍳',
  feeding: '🤲', hunger: '🍽️', meat: '🍖', alcohol: '🍷', milk: '🥛', rotten_served: '🤢', overeating: '🍽️',
  prasad: '🪔', vishnu: '🙏', shiva: '🔱', lakshmi: '🪔', durga: '🗡️', hanuman: '🐒', ganesha: '🐘',
  saraswati: '🎵', surya: '☀️', temple: '🛕', deity_general: '🛕', deity_blessing: '🙏',
  deity_angry: '⚡', idol_broken: '🗿',
  own_death: '🕯️', living_person_death: '🕯️', deceased_relative: '👤', funeral: '⚱️', corpse: '⚰️', cremation: '🔥',
  fight: '⚔️', attacked: '🛡️', wounded: '🩸', weapon: '🗡️', war: '⚔️', argument: '💬', police: '🚔',
  intimacy: '❤️', nude_desire: '❤️', romantic: '💕', faeces: '💩', toilet: '🚽', urine: '💧',
};
const CATEG: Record<string, string> = {
  snake: '🐍', death: '🕯️', deity: '🛕', water: '🌊', body: '🧍', bodily_function: '💧',
  sexual: '❤️', conflict: '⚔️', animal: '🦌', life_event: '✨', celestial: '☀️', food: '🍚',
};
function emojiFor(k?: string, c?: string) { return (k && EMOJI[k]) || (c && CATEG[c]) || '✦'; }

const TENDENCY: Record<string, { en: string; hi: string }> = {
  auspicious: { en: 'Auspicious', hi: 'शुभ' },
  inauspicious: { en: 'Read carefully', hi: 'सावधानी' },
  balanced: { en: 'Balanced', hi: 'संतुलित' },
};

interface DreamResult {
  ok: boolean;
  status: 'reading' | 'refused' | 'silent' | 'no_match';
  symbol_key?: string; category?: string;
  title_en?: string; title_hi?: string;
  reading_en?: string; reading_hi?: string;
  tendency?: 'auspicious' | 'inauspicious' | 'balanced';
  remedy_en?: string; remedy_hi?: string;
  citation?: string | null;
  disclaimer_en?: string; disclaimer_hi?: string;
  paid?: { price: number; teaser_en: string; teaser_hi: string; unlocks_en: string[]; unlocks_hi: string[] } | null;
}

export default function SwapnaClient() {
  const [dream, setDream] = useState('');
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [data, setData] = useState<DreamResult | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', place: '', dob: '', tob: '' });
  const [paidNote, setPaidNote] = useState('');

  async function reveal() {
    if (!dream.trim()) return;
    setPhase('loading'); setData(null); setShowForm(false); setPaidNote('');
    try {
      const res = await fetch('/api/dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream, tier: 'free' }),
      });
      const j: DreamResult = await res.json();
      if (!j.ok) { setPhase('error'); return; }
      setData(j); setPhase('done');
    } catch { setPhase('error'); }
  }

  function startPaidReading() {
    if (!form.name || !form.dob || !form.tob || !form.place) {
      setPaidNote('Please fill all four details to continue.');
      return;
    }
    setPaidNote('');
    // ════════════════════════════════════════════════════════════════════
    // ₹51 MOAT INTEGRATION POINT (next build step):
    //   1) open Razorpay checkout (use lib/razorpay-helper.ts)
    //   2) on payment success → POST /api/dream { tier:'paid', dream, birth:form }
    //   3) render the deep 500-word reading (dasha overlay from Component 6)
    // Until then, this is a safe placeholder.
    // ════════════════════════════════════════════════════════════════════
    setPaidNote('Personal readings open at checkout — connecting your ₹51 reading shortly.');
  }

  const emoji = emojiFor(data?.symbol_key, data?.category);
  const tend = data?.tendency ? TENDENCY[data.tendency] : null;
  const isReading = phase === 'done' && data?.status === 'reading';
  const isTerminal = phase === 'done' && data && data.status !== 'reading';

  return (
    <div style={{ maxWidth: 660, margin: '38px auto 0', position: 'relative' }}>
      <style>{`
        @keyframes sw-spin{to{transform:rotate(360deg)}}
        @keyframes sw-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes sw-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sw-pulse{0%,100%{opacity:.5}50%{opacity:1}}
        .sw-ring{position:absolute;inset:0;animation:sw-spin 46s linear infinite}
        .sw-ring.rev{animation:sw-spin 62s linear infinite reverse;inset:26px}
        .sw-float{animation:sw-float 7s ease-in-out infinite}
        .sw-rise{animation:sw-rise .7s ease both}
        .sw-btn{transition:transform .18s ease,box-shadow .18s ease}
        .sw-btn:hover{transform:translateY(-2px)}
        @media (prefers-reduced-motion:reduce){.sw-ring,.sw-float,.sw-rise{animation:none!important}}
      `}</style>

      {/* soft glow behind the box */}
      <div style={{ position: 'absolute', inset: '-40px -30px', zIndex: -1,
        background: 'radial-gradient(360px 200px at 50% 40%, rgba(212,175,55,0.12), transparent 70%)', filter: 'blur(6px)' }} />

      {/* ── DREAM BOX ── */}
      <div style={{ fontFamily: 'serif', fontSize: '1.5rem', color: '#fff', textAlign: 'center' }}>
        What did you see?
        <span className="block" style={{ fontSize: '1.12rem', color: C.s4, marginTop: 2 }} lang="hi">आपने स्वप्न में क्या देखा?</span>
      </div>

      <div style={{ marginTop: 16, background: `linear-gradient(180deg, ${C.raised}, ${C.night})`,
        border: `1px solid ${C.line2}`, borderRadius: 18, padding: 6,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.08)' }}>
        <textarea
          value={dream}
          maxLength={250}
          rows={3}
          onChange={(e) => setDream(e.target.value)}
          placeholder="A black snake glided toward me near water, and I felt afraid…"
          style={{ width: '100%', background: 'transparent', border: 0, outline: 'none', resize: 'none',
            color: '#fff', fontFamily: 'inherit', fontSize: '1.05rem', lineHeight: 1.6, padding: '18px 18px 6px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 16px 12px' }}>
          <span style={{ fontSize: 12, color: C.s5 }}>{dream.length} / 250</span>
          <span style={{ fontSize: 12, color: C.s5 }}>a line or two is enough</span>
        </div>
      </div>
      <p style={{ fontSize: 12.5, color: C.s4, textAlign: 'center', marginTop: 14 }}>
        Type it while it&apos;s still warm in your memory. No name, no birth details — just your dream.
      </p>
      <div style={{ textAlign: 'center', marginTop: 22 }}>
        <button onClick={reveal} disabled={phase === 'loading'} className="sw-btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', border: 0,
            fontWeight: 700, fontSize: '1rem', color: '#100B02',
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`, padding: '15px 30px', borderRadius: 999,
            boxShadow: '0 12px 32px rgba(168,130,10,0.35)', opacity: phase === 'loading' ? 0.6 : 1 }}>
          {phase === 'loading' ? 'Reading the symbols…' : 'Reveal its meaning →'}
        </button>
      </div>

      {/* ── LOADING ── */}
      {phase === 'loading' && (
        <div className="sw-rise" style={{ textAlign: 'center', marginTop: 40 }}>
          <div style={{ width: 60, height: 60, margin: '0 auto', borderRadius: '50%',
            border: `2px solid ${C.line}`, borderTopColor: C.gold, animation: 'sw-spin 1s linear infinite' }} />
          <p style={{ color: C.s4, marginTop: 16, fontFamily: 'serif', fontStyle: 'italic' }}>Consulting the tradition…</p>
        </div>
      )}

      {/* ── ERROR ── */}
      {phase === 'error' && (
        <div className="sw-rise" style={{ textAlign: 'center', marginTop: 34 }}>
          <p style={{ color: C.s3 }}>Something went wrong reading your dream. Please try again.</p>
          <button onClick={reveal} className="sw-btn" style={{ marginTop: 14, cursor: 'pointer',
            background: 'transparent', color: C.gold, border: `1px solid ${C.line2}`, padding: '11px 24px', borderRadius: 999 }}>
            Try again
          </button>
        </div>
      )}

      {/* ── TERMINAL (refused / silent / no_match): calm message, no paywall ── */}
      {isTerminal && (
        <div className="sw-rise" style={{ marginTop: 40, textAlign: 'center', borderTop: `1px solid ${C.line}`, paddingTop: 34 }}>
          <div style={{ fontFamily: 'serif', fontSize: '1.7rem', color: C.gold }}>{data!.title_en}</div>
          <div style={{ fontFamily: 'serif', fontSize: '1.1rem', color: C.s4 }} lang="hi">{data!.title_hi}</div>
          <p style={{ maxWidth: 540, margin: '18px auto 0', color: C.s3, fontFamily: 'serif', fontSize: '1.15rem', lineHeight: 1.5 }}>{data!.reading_en}</p>
          <p style={{ maxWidth: 540, margin: '10px auto 0', color: C.s4, fontSize: '1rem', lineHeight: 1.7 }} lang="hi">{data!.reading_hi}</p>
        </div>
      )}

      {/* ── READING RESULT + PAYWALL ── */}
      {isReading && data && (
        <div className="sw-rise" style={{ marginTop: 44 }}>
          <div style={{ textAlign: 'center', fontFamily: 'serif', fontStyle: 'italic', fontSize: '1.5rem', color: C.gold }}>
            The tradition has seen this dream before.
            <span className="block" style={{ fontStyle: 'normal', fontSize: '1.02rem', color: C.s4, marginTop: 4 }} lang="hi">
              परंपरा ने यह स्वप्न पहले भी देखा है।
            </span>
          </div>

          {/* medallion */}
          <div className="sw-float" style={{ width: 224, height: 224, margin: '26px auto 6px', position: 'relative' }}>
            <svg className="sw-ring" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="96" stroke="#C9A24B" strokeOpacity=".55" strokeWidth="1" />
              <circle cx="100" cy="100" r="82" stroke="#C9A24B" strokeOpacity=".28" strokeWidth="1" strokeDasharray="2 7" />
              <g stroke="#F0D68A" strokeWidth="1.4" strokeOpacity=".8">
                <line x1="100" y1="2" x2="100" y2="12" /><line x1="100" y1="188" x2="100" y2="198" />
                <line x1="2" y1="100" x2="12" y2="100" /><line x1="188" y1="100" x2="198" y2="100" />
              </g>
              <circle cx="100" cy="14" r="2.4" fill="#F0D68A" /><circle cx="186" cy="100" r="2.4" fill="#F0D68A" />
              <circle cx="100" cy="186" r="2.4" fill="#F0D68A" /><circle cx="14" cy="100" r="2.4" fill="#F0D68A" />
            </svg>
            <svg className="sw-ring rev" viewBox="0 0 148 148" fill="none">
              <circle cx="74" cy="74" r="70" stroke="#C9A24B" strokeOpacity=".35" strokeWidth="1" strokeDasharray="1 6" />
            </svg>
            <div style={{ position: 'absolute', inset: 38, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(240,214,138,0.2), transparent 68%)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 80, filter: 'drop-shadow(0 0 22px rgba(240,214,138,0.6))' }}>{emoji}</div>
          </div>

          <div style={{ textAlign: 'center', fontFamily: 'serif', fontSize: '2.2rem', color: '#fff' }}>
            {data.title_en}
            <span className="block" style={{ fontSize: '1.25rem', color: C.s4 }} lang="hi">{data.title_hi}</span>
          </div>

          {tend && (
            <div style={{ display: 'flex', width: 'fit-content', alignItems: 'center', gap: 7, margin: '14px auto 0',
              border: `1px solid ${C.line2}`, borderRadius: 999, padding: '6px 16px', fontSize: 12.5,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, background: 'rgba(212,175,55,0.07)' }}>
              ✦ {tend.en} · <span lang="hi">{tend.hi}</span>
            </div>
          )}

          {/* ── DREAM SUMMARY BOX (v1.1) — sized for the 75–100 word reading ── */}
          <div style={{ maxWidth: 620, margin: '26px auto 0',
            background: `linear-gradient(180deg, ${C.panel2}, rgba(8,11,18,0.85))`,
            border: `1px solid ${C.line2}`, borderRadius: 18, padding: '26px 28px',
            boxShadow: '0 18px 50px rgba(0,0,0,0.45)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase',
              color: C.goldSoft, textAlign: 'center', marginBottom: 14 }}>
              ✦ Dream Summary · <span lang="hi">स्वप्न सार</span>
            </div>
            <p style={{ fontFamily: 'serif', fontSize: '1.12rem', lineHeight: 1.7, color: '#fff' }}>{data.reading_en}</p>
            <p style={{ fontSize: '1.02rem', color: C.s4, marginTop: 14, lineHeight: 1.8,
              borderTop: `1px solid ${C.line}`, paddingTop: 14 }} lang="hi">{data.reading_hi}</p>
          </div>

          {(data.remedy_en || data.remedy_hi) && (
            <div style={{ maxWidth: 560, margin: '24px auto 0', borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, padding: '18px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.goldSoft, marginBottom: 8 }}>A gentle remedy</div>
              <p style={{ color: C.s4, fontSize: '0.97rem' }}>{data.remedy_en} {data.remedy_hi && <span lang="hi">{data.remedy_hi}</span>}</p>
            </div>
          )}
          {data.citation && (
            <div style={{ textAlign: 'center', fontSize: 12.5, color: C.s5, marginTop: 16, fontStyle: 'italic', fontFamily: 'serif' }}>{data.citation}</div>
          )}

          {/* ── PAYWALL ── */}
          {data.paid && (
            <div style={{ maxWidth: 720, margin: '52px auto 0', position: 'relative',
              background: `linear-gradient(180deg, ${C.panel2}, rgba(8,11,18,0.9))`, border: `1px solid ${C.line2}`,
              borderRadius: 24, padding: '44px 36px', boxShadow: '0 30px 80px rgba(0,0,0,0.55)' }}>
              <div style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', color: C.gold, fontSize: 24, textShadow: '0 0 18px rgba(240,214,138,0.8)' }}>✦</div>

              <div style={{ fontFamily: 'serif', fontSize: 'clamp(1.7rem,3.6vw,2.3rem)', lineHeight: 1.22, textAlign: 'center', color: '#fff' }}>
                This is what the dream means to <em style={{ color: C.gold }}>everyone</em>.<br />
                But it didn&apos;t come to everyone — it came to <em style={{ color: C.gold }}>you</em>.
              </div>
              <p style={{ maxWidth: 560, margin: '18px auto 0', textAlign: 'center', color: C.s4, fontSize: '1.02rem' }}>
                The classical meaning is <b style={{ color: '#fff', fontWeight: 500 }}>universal</b>. What it means for{' '}
                <b style={{ color: '#fff', fontWeight: 500 }}>your</b> life depends on the sky you were born under, and the
                planetary period you walk <b style={{ color: '#fff', fontWeight: 500 }}>right now</b>.
              </p>

              <div style={{ maxWidth: 520, margin: '26px auto 0', display: 'grid', gap: 12 }}>
                {data.paid.unlocks_en.map((u, i) => (
                  <div key={i} style={{ display: 'flex', gap: 13, alignItems: 'flex-start', fontSize: '0.98rem', color: '#fff' }}>
                    <span style={{ color: C.gold, flexShrink: 0 }}>✧</span>
                    <span>{u}{data.paid!.unlocks_hi[i] && <span style={{ color: C.s4 }} lang="hi"> · {data.paid!.unlocks_hi[i]}</span>}</span>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', fontFamily: 'serif', fontStyle: 'italic', fontSize: '1.25rem', color: C.goldLite, margin: '28px 0 4px' }}>
                Dreams fade by morning. Read yours while it still speaks.
              </div>
              <div style={{ textAlign: 'center', fontSize: 12.5, letterSpacing: '0.14em', color: C.s4, textTransform: 'uppercase', marginBottom: 20 }}>
                <b style={{ color: C.gold, fontSize: 15 }}>₹{data.paid.price}</b> &nbsp;·&nbsp; instant &nbsp;·&nbsp; private &nbsp;·&nbsp; no sign-up
              </div>

              {!showForm && (
                <div style={{ textAlign: 'center' }}>
                  <button onClick={() => setShowForm(true)} className="sw-btn"
                    style={{ cursor: 'pointer', border: 0, fontWeight: 700, fontSize: '1rem', color: '#100B02',
                      background: `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`, padding: '15px 30px', borderRadius: 999,
                      boxShadow: '0 12px 32px rgba(168,130,10,0.35)' }}>
                    Unlock my personal reading →
                  </button>
                </div>
              )}

              {showForm && (
                <div className="sw-rise" style={{ maxWidth: 440, margin: '10px auto 0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <input className="sw-inp" placeholder="Your name" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })} style={inpStyle} />
                    <input className="sw-inp" placeholder="Place of birth" value={form.place}
                      onChange={(e) => setForm({ ...form, place: e.target.value })} style={inpStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <input type="date" placeholder="Date of birth" value={form.dob}
                      onChange={(e) => setForm({ ...form, dob: e.target.value })} style={inpStyle} />
                    <input type="time" placeholder="Time of birth" value={form.tob}
                      onChange={(e) => setForm({ ...form, tob: e.target.value })} style={inpStyle} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <button onClick={startPaidReading} className="sw-btn"
                      style={{ marginTop: 16, cursor: 'pointer', border: 0, fontWeight: 700, fontSize: '1rem', color: '#100B02',
                        background: `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`, padding: '14px 28px', borderRadius: 999 }}>
                      Continue to ₹{data.paid.price} →
                    </button>
                  </div>
                  {paidNote && <p style={{ textAlign: 'center', color: C.goldSoft, fontSize: 13, marginTop: 12 }}>{paidNote}</p>}
                </div>
              )}
            </div>
          )}

          {/* disclaimer (Rule 0) */}
          {(data.disclaimer_en || data.disclaimer_hi) && (
            <p style={{ maxWidth: 620, margin: '24px auto 0', textAlign: 'center', fontSize: 12, color: C.s5, lineHeight: 1.7 }}>
              {data.disclaimer_en}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const inpStyle: React.CSSProperties = {
  background: '#080B12', border: '1px solid rgba(212,175,55,0.26)', borderRadius: 12,
  padding: '13px 15px', color: '#fff', fontFamily: 'inherit', fontSize: '0.95rem', width: '100%', outline: 'none',
};
