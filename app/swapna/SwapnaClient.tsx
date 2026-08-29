'use client';
// 🔱 TRIKAAL VAANI | app/swapna/SwapnaClient.tsx | v1.4 (29 Aug 2026)
// v1.4: INTERNATIONAL PRICING. The paid form charges $7 through PayPal for
//   visitors outside India, so all three price labels on this page follow the
//   same geo check — a visitor who reads ₹51 here and meets $7 on the next
//   screen has been quoted two prices for one product. goToPaidReading also
//   forwards ?intl=1, because router.push drops the query string and the
//   override would otherwise die at the page boundary.
// v1.3: PAID FLOW WIRED — the paywall's unlock button now saves the dream to
//   sessionStorage and routes to /swapna/reading (the dedicated dream form),
//   which runs the proven create-order → Razorpay → verify → predict chain on
//   the swapna_dream domain. Removed the old placeholder form + stub. BirthForm
//   is NOT touched.
// v1.2: LANGUAGE CHOICE + INLINE UNLOCK LINK.
//   - Language pills (English / हिंदी / Hinglish) above the dream box; the
//     chosen language is sent to /api/dream and the reading comes back in
//     that ONE language (halves Gemini tokens vs bilingual).
//   - Result rendering is now conditional: shows whichever language fields
//     the engine filled (backward-compatible with bilingual responses).
//   - Inline gold "Unlock for ₹51 →" link inside the Dream Summary box that
//     smooth-scrolls to the paywall card (id="swapna-paywall").
// v1.1: DREAM SUMMARY BOX — gold-bordered summary card for the 75–100 word reading.
// v1.0: Interactive dream funnel: dream box → engine (/api/dream) → result → paywall.
// Free flow is fully live. The ₹51 paid trigger is the marked integration point
// (Razorpay + Component 6 dasha overlay) — wired in the next build step.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type DreamLang = 'english' | 'hindi' | 'hinglish';
const LANG_PILLS: { key: DreamLang; label: string }[] = [
  { key: 'english', label: 'English' },
  { key: 'hindi', label: 'हिंदी' },
  { key: 'hinglish', label: 'Hinglish' },
];

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
  const [lang, setLang] = useState<DreamLang>('english');
  const [phase, setPhase] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [data, setData] = useState<DreamResult | null>(null);
  const router = useRouter();

  async function reveal() {
    if (!dream.trim()) return;
    setPhase('loading'); setData(null);
    try {
      const res = await fetch('/api/dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream, tier: 'free', language: lang }),
      });
      const j: DreamResult = await res.json();
      if (!j.ok) { setPhase('error'); return; }
      setData(j); setPhase('done');
    } catch { setPhase('error'); }
  }

  // v1.1 — international. The paid form charges $7 through PayPal for visitors
  // outside India, so every price shown HERE has to agree with it. A visitor
  // who reads ₹51 on this page and then meets $7 on the next one has been told
  // two different prices for one product.
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

  /** What this reading costs THIS visitor, as a display string. */
  const priceLabel = (inr: string | number) => (isIndia === false ? '$7' : `₹${inr}`);

  // paid flow → hand the dream to the dedicated reading form (/swapna/reading),
  // which runs the proven create-order → Razorpay → verify → predict chain,
  // or the PayPal chain for international visitors.
  function goToPaidReading() {
    if (!data) return;
    try {
      sessionStorage.setItem('tv_swapna_dream', JSON.stringify({
        dream,
        meaning: data.reading_en || data.reading_hi || '',
        symbol: data.title_en || data.title_hi || 'this symbol',
        language: lang,
      }));
    } catch { /* ignore */ }
    // Carry ?intl=1 across. router.push drops the query string, so without
    // this the override dies at the page boundary and the paid form silently
    // falls back to geo — which makes the flow untestable from India.
    const intl = typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('intl') === '1';
    router.push(intl ? '/swapna/reading?intl=1' : '/swapna/reading');
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

      {/* language pills (v1.2) — reading comes back in ONE chosen language */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
        {LANG_PILLS.map((p) => (
          <button key={p.key} onClick={() => setLang(p.key)}
            style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 999,
              border: `1px solid ${lang === p.key ? C.gold : C.line2}`,
              background: lang === p.key ? 'rgba(212,175,55,0.14)' : 'transparent',
              color: lang === p.key ? C.gold : C.s4, transition: 'all .15s ease' }}>
            {p.label}
          </button>
        ))}
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
            {data.title_en || data.title_hi}
            {data.title_en && data.title_hi ? (
              <span className="block" style={{ fontSize: '1.25rem', color: C.s4 }} lang="hi">{data.title_hi}</span>
            ) : null}
          </div>

          {tend && (
            <div style={{ display: 'flex', width: 'fit-content', alignItems: 'center', gap: 7, margin: '14px auto 0',
              border: `1px solid ${C.line2}`, borderRadius: 999, padding: '6px 16px', fontSize: 12.5,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gold, background: 'rgba(212,175,55,0.07)' }}>
              ✦ {tend.en} · <span lang="hi">{tend.hi}</span>
            </div>
          )}

          {/* ── DREAM SUMMARY BOX (v1.1; v1.2 single-language + inline unlock link) ── */}
          <div style={{ maxWidth: 620, margin: '26px auto 0',
            background: `linear-gradient(180deg, ${C.panel2}, rgba(8,11,18,0.85))`,
            border: `1px solid ${C.line2}`, borderRadius: 18, padding: '26px 28px',
            boxShadow: '0 18px 50px rgba(0,0,0,0.45)' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase',
              color: C.goldSoft, textAlign: 'center', marginBottom: 14 }}>
              ✦ Dream Summary · <span lang="hi">स्वप्न सार</span>
            </div>
            {data.reading_en ? (
              <p style={{ fontFamily: 'serif', fontSize: '1.12rem', lineHeight: 1.7, color: '#fff' }}>{data.reading_en}</p>
            ) : null}
            {data.reading_hi ? (
              <p style={{ fontSize: '1.02rem', color: data.reading_en ? C.s4 : '#fff', marginTop: data.reading_en ? 14 : 0, lineHeight: 1.8,
                borderTop: data.reading_en ? `1px solid ${C.line}` : undefined, paddingTop: data.reading_en ? 14 : 0 }} lang="hi">{data.reading_hi}</p>
            ) : null}
            {data.paid && (
              <div style={{ textAlign: 'center', marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
                <a href="#swapna-paywall"
                  onClick={(e) => { e.preventDefault(); document.getElementById('swapna-paywall')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                  style={{ color: C.gold, fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                    borderBottom: `1px solid ${C.goldSoft}`, paddingBottom: 2, cursor: 'pointer' }}>
                  {lang === 'hindi' ? `अपनी व्यक्तिगत व्याख्या ${priceLabel(51)} में अनलॉक करें →` : `Unlock your personal reading — ${priceLabel(51)} →`}
                </a>
              </div>
            )}
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
            <div id="swapna-paywall" style={{ maxWidth: 720, margin: '52px auto 0', position: 'relative',
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
                {(lang === 'hindi' ? data.paid.unlocks_hi : data.paid.unlocks_en).map((u, i) => (
                  <div key={i} style={{ display: 'flex', gap: 13, alignItems: 'flex-start', fontSize: '0.98rem', color: '#fff' }}>
                    <span style={{ color: C.gold, flexShrink: 0 }}>✧</span>
                    <span lang={lang === 'hindi' ? 'hi' : undefined}>{u}</span>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', fontFamily: 'serif', fontStyle: 'italic', fontSize: '1.25rem', color: C.goldLite, margin: '28px 0 4px' }}>
                Dreams fade by morning. Read yours while it still speaks.
              </div>
              <div style={{ textAlign: 'center', fontSize: 12.5, letterSpacing: '0.14em', color: C.s4, textTransform: 'uppercase', marginBottom: 20 }}>
                <b style={{ color: C.gold, fontSize: 15 }}>{priceLabel(data.paid.price)}</b> &nbsp;·&nbsp; instant &nbsp;·&nbsp; private &nbsp;·&nbsp; no sign-up
              </div>

              <div style={{ textAlign: 'center' }}>
                <button onClick={goToPaidReading} className="sw-btn"
                  style={{ cursor: 'pointer', border: 0, fontWeight: 700, fontSize: '1rem', color: '#100B02',
                    background: `linear-gradient(135deg, ${C.gold}, ${C.goldDeep})`, padding: '15px 34px', borderRadius: 999,
                    boxShadow: '0 12px 32px rgba(168,130,10,0.35)' }}>
                  Unlock my personal reading · {priceLabel(data.paid.price)} →
                </button>
              </div>
            </div>
          )}

          {/* disclaimer (Rule 0) */}
          {(data.disclaimer_en || data.disclaimer_hi) && (
            <p style={{ maxWidth: 620, margin: '24px auto 0', textAlign: 'center', fontSize: 12, color: C.s5, lineHeight: 1.7 }}
              lang={data.disclaimer_en ? undefined : 'hi'}>
              {data.disclaimer_en || data.disclaimer_hi}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
