'use client';

// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// FILE: components/Trikal/JiniWidget.tsx
// VERSION: 1.0 (1 Nov 2026 — pehla version; TrikalPicker ki jagah, Rohiit ji ka approved mobile design)
// ------------------------------------------------------------
// KYA HAI:
//   Jini — har page pe right side (beech mein) chirag. Client chirag ko 3 baar
//   ghista hai (ya tap) -> Jini nikalti hai. Har nayi visit pe chirag wapas;
//   ek baar nikal gayi toh us visit ke saare pages pe bahar rehti hai
//   (sessionStorage 'tv_jini_out').
//   Jini pe tap -> chat. Sawaal -> VM (mcp.trikalvaani.com/jini/):
//     POST /samjho  -> niyat (kaunsa sawaal), janam chahiye ya nahi
//     POST /uttar   -> SSE: step (Jini kaam karti dikhti hai) ... uttar
//   Uttar ke saath: darr line (sirf dosh ho tab), 2 upay, product card
//   (Razorpay product page), Rohiit ji ₹499 WhatsApp.
//   Browser seedha VM ko call karta hai — Vercel ka koi function/kharcha nahi.
// SURAKSHA:
//   - Koi dangerouslySetInnerHTML nahi; **bold** React elements se banta hai.
//   - VM band / /aaj fail -> Jini chupchaap nahi dikhti, site pe koi error nahi.
//   - Band karna ho: Vercel env NEXT_PUBLIC_DISABLE_JINI=true.
// ANALYTICS (gtag + fbq, TrikalPicker jaisa):
//   LampRub, LampDone, LampSkip, JiniOpen, JiniAsk, JiniAnswer,
//   JiniProductClick, JiniWhatsApp
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import CityInput from '@/components/calculators/CityInput';

const API = 'https://mcp.trikalvaani.com/jini';
const OUT_KEY = 'tv_jini_out';
const JANAM_KEY = 'tv_jini_janam';
const NEED = 3;
const WA_TEXT = 'Namaste Rohiit ji, main Jini (trikalvaani.com) se aaya hoon — ₹499 consultation chahiye.';

type Aaj = {
  roop: string; tyohaar: string | null; img: string; master: string;
  chirag: string | null; pose: Record<string, string>;
};
type Product = { naam: string; daam: number; url: string } | null;
type Rohiit = { naam: string; daam: number; url: string };
type Janam = {
  name: string; date: string; time: string; place: string;
  latitude: number; longitude: number; timezone: number; gender?: string;
};
type Step = { n: number; pose: string; text: string };
type Upay = { text: string; hawala?: string | null; grah?: string | null };
type Msg =
  | { k: 'user'; text: string }
  | { k: 'jini'; text: string }
  | { k: 'form'; niyat: string; sawaal: string; gender: boolean; bachcha: boolean }
  | { k: 'work'; steps: Step[]; done: boolean }
  | { k: 'answer'; text: string; darr?: string | null; upay?: Upay[]; product: Product; rohiit: Rohiit }
  | { k: 'blog'; title: string; url: string; answer?: string | null }
  | { k: 'granth'; items: { saar: string; hawala?: string }[] }
  | { k: 'card'; product: Product }
  | { k: 'wa' };

const ROHIIT_DEFAULT: Rohiit = { naam: 'Rohiit ji se seedhi baat', daam: 499, url: 'https://wa.me/919211804111' };

const CAP = ['✨ Chirag ghisiye — Trikaal aayegi', '👆 Ungli se ghisiye', 'Aapka sawaal, granthon ka uttar'];
const LINES = [
  '🙏 Namaste! Main aapki kya sahayata kar sakti hoon?',
  'Shaadi, naukri, santan — mujhse poochiye',
  'आपकी कुंडली, ग्रंथों का उत्तर',
  'Sade Sati, Manglik, Kaal Sarp — abhi jaanchiye',
  'Kundali dekh ke batati hoon — muft',
];
const DEEP = new Set(['diwali', 'dhanteras', 'govardhan-puja', 'bhai-dooj', 'chhath', 'kartik-purnima']);
const PH = ['Jaise: meri shaadi kab hogi?', 'Jaise: naukri kab lagegi?', 'Jaise: visa kab milega?', 'Jaise: Sade Sati chal rahi hai?'];
const CHIPS = ['Shaadi kab hogi?', 'Naukri kab lagegi?', 'Visa kab milega?', 'Sade Sati chal rahi hai?'];
const CATS: [string, string][] = [
  ['💼 Career / Naukri', 'Naukri kab lagegi?'],
  ['💍 Shaadi / Rishta', 'Meri shaadi kab hogi?'],
  ['👶 Santan', 'Bachcha kab hoga?'],
  ['🏠 Paisa / Property', 'Paisa kab aayega?'],
  ['🪐 Dosh / Shani', 'Sade Sati chal rahi hai kya?'],
  ['💎 Ratna', 'Kaunsa ratna pehnu?'],
];

function track(event: string, detail: Record<string, unknown> = {}) {
  try {
    const w = window as unknown as {
      fbq?: (...a: unknown[]) => void;
      gtag?: (...a: unknown[]) => void;
    };
    w.fbq?.('trackCustom', event, detail);
    w.gtag?.('event', event, detail);
  } catch { /* analytics kabhi site na tode */ }
}

function ss(key: string, val?: string): string | null {
  try {
    if (val === undefined) return window.sessionStorage.getItem(key);
    window.sessionStorage.setItem(key, val);
  } catch { /* private mode */ }
  return null;
}

/** "**bold**" aur nayi line -> React (HTML inject nahi) */
function Rich({ text }: { text: string }) {
  const lines = String(text || '').split('\n');
  return (
    <>
      {lines.map((ln, i) => (
        <span key={i}>
          {ln.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith('**') && part.endsWith('**') && part.length > 4
              ? <b key={j}>{part.slice(2, -2)}</b>
              : <span key={j}>{part}</span>
          )}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

function waUrl(r: Rohiit) {
  const base = r.url || ROHIIT_DEFAULT.url;
  return base + (base.includes('?') ? '&' : '?') + 'text=' + encodeURIComponent(WA_TEXT);
}

export default function JiniWidget() {
  const [aaj, setAaj] = useState<Aaj | null>(null);
  const [out, setOut] = useState(false);
  const [entered, setEntered] = useState(false);   // nikalne ka animation sirf isi visit mein
  const [rubs, setRubs] = useState(0);
  const [shake, setShake] = useState(0);
  const [puffs, setPuffs] = useState<number[]>([]);
  const [burst, setBurst] = useState(false);
  const [capI, setCapI] = useState(0);
  const [bubI, setBubI] = useState(0);
  const [bubOn, setBubOn] = useState(false);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState('');
  const [typed, setTyped] = useState(false);
  const [phI, setPhI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [pose, setPose] = useState<string | null>(null);
  const [saved, setSaved] = useState<Janam | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const rubsRef = useRef(0);
  const outRef = useRef(false);
  const rubRef = useRef({ lastX: null as number | null, dir: 0, travel: 0, moved: false, started: false });
  const disabled = process.env.NEXT_PUBLIC_DISABLE_JINI === 'true';

  // ---- /aaj: aaj ki Jini (tyohaar ya master). Fail -> kuch nahi dikhega.
  useEffect(() => {
    if (disabled) return;
    let live = true;
    const cached = ss('tv_jini_aaj');
    if (cached) {
      try { setAaj(JSON.parse(cached)); } catch { /* ignore */ }
    }
    fetch(API + '/aaj', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: Aaj) => {
        if (!live || !d || !d.img) return;
        setAaj(d);
        ss('tv_jini_aaj', JSON.stringify(d));
      })
      .catch(() => { if (live && !cached) setAaj(null); });
    if (ss(OUT_KEY) === '1') { outRef.current = true; setOut(true); setBubOn(true); }
    const j = ss(JANAM_KEY);
    if (j) { try { setSaved(JSON.parse(j)); } catch { /* ignore */ } }
    return () => { live = false; };
  }, [disabled]);

  // ---- caption / bubble / placeholder ghoomte rahein
  useEffect(() => {
    if (out) return;
    const t = setInterval(() => setCapI((i) => (i + 1) % CAP.length), 3000);
    return () => clearInterval(t);
  }, [out]);

  const lines = aaj?.tyohaar
    ? [`${DEEP.has(aaj.roop) ? '🪔' : '✨'} ${aaj.tyohaar}! Main aapki kya sahayata kar sakti hoon?`, ...LINES.slice(1)]
    : LINES;

  useEffect(() => {
    if (!out || open) return;
    const t = setInterval(() => setBubI((i) => (i + 1) % LINES.length), 3500);
    return () => clearInterval(t);
  }, [out, open]);

  useEffect(() => {
    if (!open || typed) return;
    const t = setInterval(() => setPhI((i) => (i + 1) % PH.length), 2500);
    return () => clearInterval(t);
  }, [open, typed]);

  // ---- chat neeche scroll
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, busy]);

  // ---- mobile pe chat khuli ho toh peeche ka page scroll na ho
  useEffect(() => {
    if (!open) return;
    const mobile = window.matchMedia('(max-width: 640px)').matches;
    if (!mobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // ---- Esc se chat band
  useEffect(() => {
    if (!open) return;
    const f = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [open]);

  const emerge = useCallback((seedha: boolean) => {
    if (outRef.current) return;
    outRef.current = true;
    track(seedha ? 'LampSkip' : 'LampDone', { page: location.pathname });
    setRubs(NEED);
    setBurst(true);
    setTimeout(() => setBurst(false), 1100);
    setOut(true);
    setEntered(true);
    ss(OUT_KEY, '1');
    setTimeout(() => setBubOn(true), 900);
  }, []);

  const rub = useCallback(() => {
    if (outRef.current) return;
    if (!rubRef.current.started) {
      rubRef.current.started = true;
      track('LampRub', { page: location.pathname });
    }
    const id = Date.now() + Math.random();
    setPuffs((p) => [...p, id]);
    setTimeout(() => setPuffs((p) => p.filter((x) => x !== id)), 1200);
    setShake((s) => s + 1);
    rubsRef.current += 1;
    setRubs(rubsRef.current);
    if (rubsRef.current >= NEED) emerge(false);
  }, [emerge]);

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = rubRef.current;
    r.lastX = e.clientX; r.dir = 0; r.travel = 0; r.moved = false;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = rubRef.current;
    if (r.lastX === null) return;
    const dx = e.clientX - r.lastX;
    if (Math.abs(dx) < 3) return;
    r.moved = true;
    const d = Math.sign(dx);
    r.travel += Math.abs(dx);
    if (r.dir && d !== r.dir && r.travel > 18) { rub(); r.travel = 0; }
    r.dir = d; r.lastX = e.clientX;
  };
  const onUp = () => {
    const r = rubRef.current;
    if (!r.moved && r.lastX !== null) rub();
    r.lastX = null;
  };

  const openChat = () => {
    setOpen(true);
    track('JiniOpen', { page: location.pathname });
    if (msgs.length === 0) {
      const hi = aaj?.tyohaar ? `${DEEP.has(aaj.roop) ? '🪔' : '✨'} **${aaj.tyohaar}!** ` : '🙏 **Namaste!** ';
      setMsgs([{ k: 'jini', text: hi + 'Main aapki kya sahayata kar sakti hoon? Apna sawaal likhiye ya neeche chuniye.' }]);
    }
    setTimeout(() => { try { inputRef.current?.focus({ preventScroll: true }); } catch { /* ignore */ } }, 350);
  };

  const push = (...m: Msg[]) => setMsgs((x) => [...x, ...m]);

  // ---- /uttar (SSE) — Jini ke steps live
  const runUttar = async (niyat: string, sawaal: string, janam: Partial<Janam> | null) => {
    setBusy(true);
    let steps: Step[] = [];
    push({ k: 'work', steps: [], done: false });
    const setWork = (s: Step[], done: boolean) =>
      setMsgs((x) => {
        const y = [...x];
        for (let i = y.length - 1; i >= 0; i--) {
          if (y[i].k === 'work') { y[i] = { k: 'work', steps: s, done }; break; }
        }
        return y;
      });
    let gotAnswer = false;
    try {
      const res = await fetch(API + '/uttar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niyat, sawaal, janam: janam || {} }),
      });
      if (res.status === 429) {
        const d = await res.json().catch(() => ({}));
        setWork(steps, true);
        push({ k: 'jini', text: d.text || 'Aaj ke liye bahut sawaal ho gaye — kal phir poochiye.' }, { k: 'wa' });
        return;
      }
      if (!res.ok || !res.body) throw new Error('uttar ' + res.status);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      const handle = (ev: string, data: Record<string, unknown>) => {
        if (ev === 'step') {
          steps = [...steps, data as unknown as Step];
          setWork(steps, false);
          setPose(String(data.pose || ''));
        } else if (ev === 'uttar') {
          gotAnswer = true;
          setWork(steps, true);
          setPose('thumbs');
          push({
            k: 'answer',
            text: String(data.text || ''),
            darr: (data.darr as string) || null,
            upay: (Array.isArray(data.upay) ? data.upay : [])
              .map((u: unknown) => (typeof u === 'string' ? { text: u } : (u as Upay)))
              .filter((u: Upay) => u && typeof u.text === 'string' && u.text.trim()),
            product: (data.product as Product) || null,
            rohiit: (data.rohiit as Rohiit) || ROHIIT_DEFAULT,
          });
          track('JiniAnswer', { niyat });
        } else if (ev === 'galti') {
          gotAnswer = true;
          setWork(steps, true);
          setPose('soch');
          push({ k: 'jini', text: String(data.text || 'Abhi rukawat aayi — dobara poochiye.') }, { k: 'wa' });
        }
      };
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let cut: number;
        while ((cut = buf.indexOf('\n\n')) >= 0) {
          const block = buf.slice(0, cut);
          buf = buf.slice(cut + 2);
          let ev = 'message';
          let data = '';
          for (const line of block.split('\n')) {
            if (line.startsWith('event:')) ev = line.slice(6).trim();
            else if (line.startsWith('data:')) data += line.slice(5).trim();
          }
          if (data) {
            try { handle(ev, JSON.parse(data)); } catch { /* adhoora block */ }
          }
        }
      }
      if (!gotAnswer) throw new Error('khaali');
    } catch {
      if (!gotAnswer) {
        setWork(steps, true);
        push({ k: 'jini', text: 'Abhi Trikaal tak pahunch nahi ho pa rahi — thodi der baad poochiye, ya Rohiit ji se seedhi baat karein.' }, { k: 'wa' });
      }
    } finally {
      setBusy(false);
      setTimeout(() => setPose(null), 4000);
    }
  };

  // ---- /samjho — sawaal kis baare mein hai
  const ask = async (raw?: string) => {
    const sawaal = (raw ?? q).trim();
    if (sawaal.length < 2 || busy) return;
    setQ('');
    setTyped(true);
    push({ k: 'user', text: sawaal });
    track('JiniAsk', { page: location.pathname });
    setBusy(true);
    setPose('soch');
    let d: Record<string, any> = {};
    try {
      const res = await fetch(API + '/samjho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sawaal }),
      });
      d = await res.json().catch(() => ({}));
      if (res.status === 429) {
        push({ k: 'jini', text: d.text || 'Aaj ke liye bahut sawaal ho gaye — kal phir poochiye.' }, { k: 'wa' });
        setBusy(false); setPose(null);
        return;
      }
      if (!res.ok || !d.ok) throw new Error('samjho');
    } catch {
      push({ k: 'jini', text: 'Abhi Trikaal tak pahunch nahi ho pa rahi — thodi der baad poochiye, ya Rohiit ji se seedhi baat karein.' }, { k: 'wa' });
      setBusy(false); setPose(null);
      return;
    }
    setBusy(false);
    setPose(null);

    // niyat nahi mili -> lekh / granth / Rohiit ji
    if (!d.niyat) {
      const m: Msg[] = [];
      if (d.blog?.url) {
        m.push({ k: 'jini', text: 'Is sawaal pe Trikaal Vaani ka yeh lekh dekhiye:' });
        m.push({ k: 'blog', title: d.blog.title || 'Lekh padhiye', url: d.blog.url, answer: d.blog.answer });
      } else if (Array.isArray(d.granth) && d.granth.length) {
        m.push({ k: 'jini', text: 'Granth is baare mein kehte hain:' });
        m.push({ k: 'granth', items: d.granth });
      } else {
        m.push({ k: 'jini', text: 'Is sawaal ka sateek uttar aapki poori kundali dekh ke hi milega.' });
      }
      m.push({ k: 'jini', text: 'Aapki baat ko gehraai se samajhne ke liye Rohiit ji se seedhi baat kar sakte hain:' }, { k: 'wa' });
      push(...m);
      return;
    }

    // seedha calculator wale sawaal
    if (d.seedha_page) {
      if (d.janam === 'photo') { await runUttar(d.niyat, sawaal, null); return; }
      push(
        { k: 'jini', text: 'Iske liye details zyada chahiye — seedha calculator mein bhariye, wahin poora uttar milega:' },
        { k: 'card', product: d.product || null },
      );
      return;
    }

    // janam nahi chahiye (panchang, sapna...)
    if (d.janam === 'nahi') { await runUttar(d.niyat, sawaal, null); return; }

    // janam chahiye
    push(
      { k: 'jini', text: d.janam === 'bachcha' ? 'Bachche ki janam tithi, samay aur sthaan bataiye:' : 'Aapki kundali dekh ke batati hoon — janam ki details bataiye:' },
      { k: 'form', niyat: d.niyat, sawaal, gender: !!d.gender_chahiye, bachcha: d.janam === 'bachcha' },
    );
  };

  const submitForm = (m: Extract<Msg, { k: 'form' }>, j: Janam) => {
    setMsgs((x) => x.filter((y) => y !== m));
    push({ k: 'user', text: `${j.name ? j.name + ' · ' : ''}${j.date.split('-').reverse().join('-')} · ${j.time} · ${j.place}` });
    if (!m.bachcha) { setSaved(j); ss(JANAM_KEY, JSON.stringify(j)); }
    runUttar(m.niyat, m.sawaal, j);
  };

  if (disabled || !aaj) return null;

  const jiniImg = aaj.img || aaj.master;
  const avatar = (pose && aaj.pose?.[pose]) || jiniImg;
  const p = Math.min(rubs / NEED, 1);

  return (
    <>
      <style>{CSS}</style>

      {/* ------------ CHIRAG / JINI (right side, beech mein) ------------ */}
      {!open && (
        <div className="tvj-dock" style={{ ['--p' as string]: p } as React.CSSProperties}>
          {!out && (
            <>
              <div className="tvj-cap" key={capI}>{CAP[capI]}</div>
              <div
                className="tvj-lamp"
                role="button"
                tabIndex={0}
                aria-label="Chirag ghisiye — Trikaal aayegi"
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={() => { rubRef.current.lastX = null; }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rub(); } }}
              >
                <div className="tvj-glow" />
                {aaj.chirag
                  ? <img key={shake} className={shake ? 'tvj-shk' : ''} src={aaj.chirag} alt="Chirag" draggable={false} />
                  : <div className="tvj-lamp-emoji">🪔</div>}
                {puffs.map((id) => <i key={id} className="tvj-puff" />)}
              </div>
              {rubs === 0 && <div className="tvj-hand" aria-hidden>👆</div>}
              <div className="tvj-meter"><i /></div>
              <button type="button" className="tvj-skip" onClick={() => emerge(true)}>ya seedha poochiye ›</button>
            </>
          )}
          {burst && <div className="tvj-burst" />}
          {out && (
            <>
              <div className={'tvj-bub' + (bubOn ? ' on' : '')} onClick={openChat} key={bubI}>{lines[bubI % lines.length]}</div>
              <div
                className={'tvj-jini' + (entered ? ' tvj-enter' : '')}
                role="button"
                tabIndex={0}
                aria-label="Trikaal se poochiye"
                onClick={openChat}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openChat(); } }}
              >
                <div className="tvj-glow" />
                <img src={jiniImg} alt="Trikaal" draggable={false} />
                <i className="tvj-spark" style={{ left: 6, top: 14, animationDelay: '.2s' }} />
                <i className="tvj-spark" style={{ right: 4, top: 30, animationDelay: '1s' }} />
                <i className="tvj-spark" style={{ left: 46, top: -4, animationDelay: '1.7s' }} />
                <i className="tvj-spark" style={{ right: 18, bottom: 6, animationDelay: '.6s' }} />
              </div>
              {bubOn && <button type="button" className="tvj-label" onClick={openChat}>💬 Poochiye</button>}
            </>
          )}
        </div>
      )}

      {/* ------------ CHAT ------------ */}
      {open && (
        <div className="tvj-sheet" role="dialog" aria-label="Trikaal se baat">
          <div className="tvj-head">
            <div className={'tvj-ava' + (busy ? ' tvj-busy' : '')}><img src={avatar} alt="" /></div>
            <div>
              <b>Trikaal</b>
              <span>{busy ? 'Kaam kar rahi hoon…' : 'Granth aur aapki kundali se uttar'}</span>
            </div>
            <button type="button" aria-label="Band karein" onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="tvj-body" ref={bodyRef}>
            {msgs.map((m, i) => (
              <MsgView key={i} m={m} first={i === 0} avatarFor={(ps) => aaj.pose?.[ps] || jiniImg}
                saved={saved} onSubmit={submitForm} onChip={(t) => { setQ(t); setTyped(true); inputRef.current?.focus(); }} />
            ))}
            {msgs.length <= 1 && (
              <div className="tvj-cats">
                {CATS.map(([label, ques]) => (
                  <button type="button" key={label} onClick={() => { setQ(ques); setTyped(true); inputRef.current?.focus(); }}>{label}</button>
                ))}
              </div>
            )}
            {msgs.length <= 1 && <WaRow r={ROHIIT_DEFAULT} />}
            {busy && !msgs.some((m) => m.k === 'work' && !m.done) && <div className="tvj-m tvj-dots"><i /><i /><i /></div>}
          </div>

          <form className="tvj-ask" onSubmit={(e) => { e.preventDefault(); ask(); }}>
            {!typed && <span className="tvj-hint">⬇ Yahan tap karke apna sawaal likhiye</span>}
            <input
              ref={inputRef}
              className={typed ? '' : 'tvj-call'}
              value={q}
              maxLength={300}
              placeholder={PH[phI]}
              aria-label="Apna sawaal likhiye"
              onChange={(e) => { setQ(e.target.value); setTyped(true); }}
            />
            <button type="submit" disabled={busy || q.trim().length < 2} aria-label="Bhejiye">➤</button>
          </form>
        </div>
      )}
    </>
  );
}

// ============================================================
// Chat ke andar ke hisse
// ============================================================
function WaRow({ r }: { r: Rohiit }) {
  return (
    <a className="tvj-wa" href={waUrl(r)} target="_blank" rel="noopener noreferrer"
      onClick={() => track('JiniWhatsApp', { page: location.pathname })}>
      📞 {r.naam || 'Rohiit ji se seedhi baat'} · ₹{r.daam || 499}
    </a>
  );
}

function ProductCard({ p }: { p: Product }) {
  if (!p) return null;
  const free = !p.daam;
  return (
    <a className="tvj-prod" href={p.url} onClick={() => track('JiniProductClick', { product: p.naam, value: p.daam })}>
      <span className="tvj-prod-t">{p.naam}</span>
      <span className="tvj-prod-c">{free ? 'Muft dekhiye ›' : `Poori report · ₹${p.daam} ›`}</span>
    </a>
  );
}

function MsgView({ m, first, avatarFor, saved, onSubmit, onChip }: {
  m: Msg; first: boolean; avatarFor: (pose: string) => string; saved: Janam | null;
  onSubmit: (m: Extract<Msg, { k: 'form' }>, j: Janam) => void; onChip: (t: string) => void;
}) {
  switch (m.k) {
    case 'user':
      return <div className="tvj-u">{m.text}</div>;
    case 'jini':
      return (
        <div className="tvj-m">
          <Rich text={m.text} />
          {first && (
            <div className="tvj-chips">
              {CHIPS.map((c) => <button type="button" key={c} onClick={() => onChip(c)}>{c}</button>)}
            </div>
          )}
        </div>
      );
    case 'form':
      return <BirthForm m={m} saved={m.bachcha ? null : saved} onSubmit={onSubmit} />;
    case 'work': {
      const last = m.steps[m.steps.length - 1];
      return (
        <div className="tvj-m tvj-work">
          {last && !m.done && <img className="tvj-pose" src={avatarFor(last.pose)} alt="" />}
          <ol>
            {m.steps.map((s, i) => (
              <li key={i} className={i === m.steps.length - 1 && !m.done ? 'now' : 'ok'}>
                <span>{i === m.steps.length - 1 && !m.done ? '⏳' : '✓'}</span> {s.text}
              </li>
            ))}
            {m.steps.length === 0 && <li className="now"><span>⏳</span> Shuru kar rahi hoon…</li>}
          </ol>
        </div>
      );
    }
    case 'answer':
      return (
        <div className="tvj-ans">
          <div className="tvj-m"><Rich text={m.text} /></div>
          {m.darr && <div className="tvj-darr">⚠️ <Rich text={m.darr} /></div>}
          {m.upay && m.upay.length > 0 && (
            <div className="tvj-upay">
              <b>🪔 Aapke liye {m.upay.length === 1 ? 'upay' : `${m.upay.length} upay`}</b>
              <ol>{m.upay.map((u, i) => (
                <li key={i}><Rich text={u.text} />{u.hawala && <em className="tvj-haw"> — {u.hawala}</em>}</li>
              ))}</ol>
            </div>
          )}
          <ProductCard p={m.product} />
          <WaRow r={m.rohiit} />
        </div>
      );
    case 'blog':
      return (
        <a className="tvj-prod" href={m.url}>
          <span className="tvj-prod-t">{m.title}</span>
          {m.answer && <span className="tvj-prod-a">{m.answer.length > 220 ? m.answer.slice(0, 220) + '…' : m.answer}</span>}
          <span className="tvj-prod-c">Poora lekh padhiye ›</span>
        </a>
      );
    case 'granth':
      return (
        <div className="tvj-m">
          {m.items.slice(0, 2).map((g, i) => (
            <p key={i} style={{ margin: i ? '8px 0 0' : 0 }}>
              <Rich text={String(g.saar || '')} />{g.hawala && <em className="tvj-haw"> — {g.hawala}</em>}
            </p>
          ))}
        </div>
      );
    case 'card':
      return <ProductCard p={m.product} />;
    case 'wa':
      return <WaRow r={ROHIIT_DEFAULT} />;
  }
}

function BirthForm({ m, saved, onSubmit }: {
  m: Extract<Msg, { k: 'form' }>; saved: Janam | null; onSubmit: (m: Extract<Msg, { k: 'form' }>, j: Janam) => void;
}) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState<{ city: string; lat: number; lng: number; tz: number } | null>(null);
  const [gender, setGender] = useState('');
  const [err, setErr] = useState('');
  const [useSaved, setUseSaved] = useState(!!saved);
  const today = new Date().toISOString().slice(0, 10);

  if (useSaved && saved) {
    const needG = m.gender && !saved.gender;
    return (
      <div className="tvj-form">
        <div className="tvj-saved">
          {saved.name ? <b>{saved.name}</b> : 'Pichli details'} · {saved.date.split('-').reverse().join('-')} · {saved.time} · {saved.place}
        </div>
        {needG && (
          <select value={gender} onChange={(e) => setGender(e.target.value)} aria-label="Ling">
            <option value="">Aap kaun hain?</option>
            <option value="male">Purush</option>
            <option value="female">Mahila</option>
          </select>
        )}
        {err && <p className="tvj-err">{err}</p>}
        <div className="tvj-row">
          <button type="button" className="tvj-go" onClick={() => {
            if (needG && !gender) { setErr('Kripya chuniye — purush ya mahila.'); return; }
            onSubmit(m, { ...saved, ...(needG ? { gender } : {}) });
          }}>Inhi details se dekhiye ✨</button>
          <button type="button" className="tvj-alt" onClick={() => setUseSaved(false)}>Nayi details</button>
        </div>
      </div>
    );
  }

  const go = () => {
    if (!date || date < '1900-01-01' || date > today) { setErr('Sahi janam tithi bhariye.'); return; }
    if (!time) { setErr('Janam ka samay bhariye (andaza bhi chalega).'); return; }
    if (!place) { setErr('Janam sthaan list mein se chuniye.'); return; }
    if (m.gender && !gender) { setErr('Kripya chuniye — purush ya mahila.'); return; }
    setErr('');
    onSubmit(m, {
      name: name.trim().slice(0, 60), date, time, place: place.city,
      latitude: place.lat, longitude: place.lng, timezone: place.tz,
      ...(m.gender ? { gender } : {}),
    });
  };

  return (
    <div className="tvj-form">
      <input placeholder={m.bachcha ? 'Bachche ka naam (zaroori nahi)' : 'Aapka naam (zaroori nahi)'} value={name}
        maxLength={60} onChange={(e) => setName(e.target.value)} aria-label="Naam" />
      <div className="tvj-row">
        <label>Janam tithi<input type="date" value={date} min="1900-01-01" max={today} onChange={(e) => setDate(e.target.value)} /></label>
        <label>Samay<input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label>
      </div>
      <CityInput id={'tvj-city-' + m.niyat} value={place?.city || ''}
        onSelect={(city, lat, lng, tz) => setPlace({ city, lat, lng, tz })} />
      {m.gender && (
        <select value={gender} onChange={(e) => setGender(e.target.value)} aria-label="Ling">
          <option value="">Aap kaun hain?</option>
          <option value="male">Purush</option>
          <option value="female">Mahila</option>
        </select>
      )}
      {err && <p className="tvj-err">{err}</p>}
      <button type="button" className="tvj-go" onClick={go}>Kundali dekhiye ✨</button>
      <p className="tvj-priv">Aapki details sirf is uttar ke liye — hamare server pe save nahi hoti.</p>
    </div>
  );
}

// ============================================================
// CSS (approved mockup se) — sab classes "tvj-" se, site pe kuch na takraye
// ============================================================
const CSS = `
.tvj-dock{position:fixed;right:4px;top:41%;width:108px;height:108px;z-index:9990;--gold:#D4AF37;--gold2:#f3d77a;font-family:inherit}
.tvj-lamp{position:absolute;inset:0;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;outline:none}
.tvj-glow{position:absolute;inset:-18px;border-radius:50%;mix-blend-mode:screen;pointer-events:none;
 background:radial-gradient(circle,rgba(255,225,140,calc(.25 + var(--p,0)*.5)) 0%,rgba(212,175,55,calc(.12 + var(--p,0)*.3)) 40%,rgba(212,175,55,0) 70%);animation:tvjPulse 2.4s ease-in-out infinite}
.tvj-lamp img,.tvj-jini img{position:relative;width:100%;height:100%;object-fit:cover;mix-blend-mode:screen;pointer-events:none;
 -webkit-mask-image:radial-gradient(circle,#000 58%,transparent 72%);mask-image:radial-gradient(circle,#000 58%,transparent 72%)}
.tvj-lamp img{filter:brightness(calc(1.05 + var(--p,0)*.6));animation:tvjWobble 3s ease-in-out infinite}
.tvj-lamp-emoji{position:relative;font-size:64px;text-align:center;line-height:108px}
.tvj-lamp img.tvj-shk{animation:tvjShake .35s,tvjWobble 3s ease-in-out .35s infinite}
.tvj-cap{position:absolute;right:0;bottom:calc(100% + 8px);width:max-content;max-width:200px;font-size:12.5px;font-weight:700;color:#fff3c4;text-align:center;
 background:rgba(20,16,50,.38);border:1px solid rgba(243,215,122,.7);border-radius:12px;padding:6px 10px;text-shadow:0 0 6px #000,0 0 2px #000;
 box-shadow:0 0 14px rgba(243,215,122,.35);animation:tvjFade .3s;pointer-events:none}
.tvj-meter{position:absolute;right:14px;top:calc(100% - 8px);width:80px;height:5px;border-radius:4px;background:rgba(255,255,255,.15);overflow:hidden;pointer-events:none}
.tvj-meter i{display:block;height:100%;width:calc(var(--p,0)*100%);background:linear-gradient(90deg,#e6c454,#fff1b0);transition:width .25s}
.tvj-skip{position:absolute;right:2px;top:calc(100% + 4px);width:max-content;font-size:11.5px;color:#fff3c4;text-shadow:0 0 4px #000,0 0 2px #000;text-decoration:underline;
 cursor:pointer;opacity:.9;background:none;border:0;padding:4px}
.tvj-puff{position:absolute;left:18px;top:28px;width:26px;height:26px;border-radius:50%;pointer-events:none;
 background:radial-gradient(circle,rgba(255,250,230,.9),rgba(255,230,160,0) 70%);animation:tvjPuff 1.1s ease-out forwards}
.tvj-hand{position:absolute;right:62%;top:44px;font-size:26px;pointer-events:none;animation:tvjRub 1.4s ease-in-out infinite}
.tvj-jini{position:absolute;right:0;top:-4px;width:104px;height:104px;cursor:pointer;outline:none;animation:tvjFloat 3.6s ease-in-out infinite;-webkit-tap-highlight-color:transparent}
.tvj-jini.tvj-enter{animation:tvjEmerge 1.1s cubic-bezier(.2,.9,.3,1.2) both,tvjFloat 3.6s ease-in-out 1.1s infinite}
.tvj-jini .tvj-glow{inset:-14px;background:radial-gradient(circle,rgba(255,225,140,.35) 0%,rgba(212,175,55,.16) 40%,rgba(212,175,55,0) 70%);animation-duration:2.6s}
.tvj-jini img{opacity:.92;filter:brightness(1.15) contrast(1.05);-webkit-mask-image:radial-gradient(circle,#000 60%,transparent 74%);mask-image:radial-gradient(circle,#000 60%,transparent 74%)}
.tvj-spark{position:absolute;width:5px;height:5px;border-radius:50%;background:#fff6c8;box-shadow:0 0 8px 2px #ffd86b;opacity:0;animation:tvjTw 2.4s ease-in-out infinite;pointer-events:none}
.tvj-bub{position:absolute;right:0;bottom:calc(100% + 0px);width:max-content;max-width:220px;background:rgba(20,16,50,.38);color:#fff3c4;border:1px solid rgba(243,215,122,.7);
 text-shadow:0 0 6px rgba(0,0,0,.95),0 0 2px #000;font-size:13px;font-weight:700;padding:8px 11px;border-radius:14px 14px 4px 14px;box-shadow:0 0 14px rgba(243,215,122,.35);
 opacity:0;transform:translateY(8px);transition:.35s;cursor:pointer;line-height:1.35}
.tvj-bub.on{opacity:1;transform:none;animation:tvjFade .3s}
.tvj-label{position:absolute;right:6px;top:calc(100% + 2px);font-size:11.5px;font-weight:700;color:#1a1405;background:rgba(230,196,84,.85);border:0;border-radius:20px;padding:3px 10px;cursor:pointer;width:max-content}
.tvj-burst{position:absolute;right:-24px;top:-24px;width:150px;height:150px;border-radius:50%;pointer-events:none;
 background:radial-gradient(circle,rgba(255,250,225,.95),rgba(255,220,140,.4) 40%,rgba(255,220,140,0) 70%);animation:tvjBurst 1s ease-out forwards}
@keyframes tvjFloat{50%{transform:translateY(-6px)}}
@keyframes tvjPulse{0%,100%{transform:scale(.92);opacity:.75}50%{transform:scale(1.08);opacity:1}}
@keyframes tvjTw{0%,100%{opacity:0;transform:scale(.4)}50%{opacity:1;transform:scale(1)}}
@keyframes tvjWobble{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
@keyframes tvjShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px) rotate(-4deg)}75%{transform:translateX(5px) rotate(4deg)}}
@keyframes tvjPuff{0%{opacity:.9;transform:translate(0,0) scale(.6)}100%{opacity:0;transform:translate(-14px,-60px) scale(2.4)}}
@keyframes tvjRub{0%,100%{transform:translateX(-14px)}50%{transform:translateX(14px)}}
@keyframes tvjEmerge{0%{opacity:0;transform:translateY(40px) scale(.2)}60%{opacity:1;transform:translateY(-8px) scale(1.08)}100%{opacity:1;transform:none}}
@keyframes tvjBurst{0%{opacity:0;transform:scale(.3)}30%{opacity:1}100%{opacity:0;transform:scale(1.8)}}
@keyframes tvjFade{from{opacity:0}to{opacity:1}}
@keyframes tvjCall{0%,100%{box-shadow:0 0 0 0 rgba(243,215,122,0)}50%{box-shadow:0 0 0 4px rgba(243,215,122,.35),0 0 18px rgba(243,215,122,.45)}}
@keyframes tvjDot{0%,80%,100%{opacity:.25}40%{opacity:1}}
@keyframes tvjSpin{to{transform:rotate(360deg)}}

.tvj-sheet{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;background:linear-gradient(180deg,#15133b,#0B0A22);color:#efeaf9;
 font-size:14px;line-height:1.5;animation:tvjFade .25s}
@media (min-width:641px){.tvj-sheet{inset:auto 16px 16px auto;width:400px;height:min(660px,calc(100vh - 32px));border-radius:18px;border:1px solid #2c2860;
 box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 30px rgba(243,215,122,.15);overflow:hidden}}
.tvj-head{display:flex;align-items:center;gap:10px;padding:12px;border-bottom:1px solid #2c2860}
.tvj-ava{width:60px;height:60px;border-radius:50%;overflow:hidden;flex:none;box-shadow:0 0 0 2px #D4AF37,0 0 22px rgba(243,215,122,.5)}
.tvj-ava img{width:100%;height:100%;object-fit:cover}
.tvj-ava.tvj-busy{box-shadow:0 0 0 2px #f3d77a,0 0 30px rgba(243,215,122,.85)}
.tvj-head b{color:#f3d77a;font-size:17px;display:block}.tvj-head span{font-size:11.5px;color:#a9a3c9}
.tvj-head button{margin-left:auto;background:none;border:0;color:#a9a3c9;font-size:28px;cursor:pointer;line-height:1;padding:4px 8px}
.tvj-body{flex:1;padding:12px;display:flex;flex-direction:column;gap:10px;overflow-y:auto;overscroll-behavior:contain}
.tvj-m{background:#1b1946;border:1px solid #2c2860;border-radius:14px;border-top-left-radius:4px;padding:10px 12px;font-size:13.5px;max-width:94%}
.tvj-m b{color:#f3d77a}
.tvj-u{align-self:flex-end;background:#3a2f0e;border:1px solid #8a6d1f;color:#fff3c4;border-radius:14px;border-top-right-radius:4px;padding:8px 12px;font-size:13.5px;max-width:85%;word-break:break-word}
.tvj-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.tvj-chips button{font-size:12px;padding:6px 10px;border-radius:20px;border:1px solid #D4AF37;color:#f3d77a;background:none;cursor:pointer}
.tvj-cats{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.tvj-cats button{background:#1f1c4f;border:1px solid #2c2860;border-radius:10px;padding:9px 8px;font-size:12.5px;color:#efeaf9;text-align:left;cursor:pointer}
.tvj-wa{display:flex;gap:8px;align-items:center;background:#0f2a1c;border:1px solid #1f6b43;border-radius:12px;padding:9px 11px;font-size:13px;color:#7fe3a9;text-decoration:none;font-weight:600}
.tvj-prod{display:flex;flex-direction:column;gap:3px;background:linear-gradient(135deg,#2a2208,#1b1946);border:1px solid #D4AF37;border-radius:12px;padding:10px 12px;text-decoration:none;
 box-shadow:0 0 14px rgba(243,215,122,.2)}
.tvj-prod-t{color:#fff3c4;font-weight:700;font-size:13.5px}.tvj-prod-a{color:#cfc8ea;font-size:12.5px}.tvj-prod-c{color:#f3d77a;font-size:12.5px;font-weight:700}
.tvj-work ol{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px}
.tvj-work li{font-size:13px;color:#cfc8ea}.tvj-work li.now{color:#fff3c4;font-weight:600}.tvj-work li.ok span{color:#7fe3a9}
.tvj-pose{width:84px;height:84px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 8px;box-shadow:0 0 0 2px #D4AF37,0 0 26px rgba(243,215,122,.6);animation:tvjFade .4s}
.tvj-ans{display:flex;flex-direction:column;gap:8px}
.tvj-darr{background:#2e1212;border:1px solid #8a2b2b;color:#ffd0c7;border-radius:12px;padding:9px 11px;font-size:13px}
.tvj-upay{background:#1b1946;border:1px solid #6b5a1e;border-radius:12px;padding:9px 11px;font-size:13px}
.tvj-upay b{color:#f3d77a}.tvj-upay ol{margin:6px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:6px}
.tvj-haw{color:#a9a3c9;font-size:12px}
.tvj-dots{display:flex;gap:5px;width:max-content}.tvj-dots i{width:7px;height:7px;border-radius:50%;background:#f3d77a;animation:tvjDot 1.2s infinite}
.tvj-dots i:nth-child(2){animation-delay:.2s}.tvj-dots i:nth-child(3){animation-delay:.4s}
.tvj-form{display:flex;flex-direction:column;gap:8px;background:#1b1946;border:1px solid #2c2860;border-radius:14px;padding:10px}
.tvj-form input,.tvj-form select{width:100%;background:#0d1120;border:1px solid rgba(255,255,255,.1);color:#e2e8f0;border-radius:8px;padding:9px 10px;font-size:14px;color-scheme:dark}
.tvj-form label{flex:1;display:flex;flex-direction:column;gap:3px;font-size:11.5px;color:#a9a3c9;min-width:0}
.tvj-row{display:flex;gap:8px}
.tvj-go{background:linear-gradient(180deg,#e6c454,#b8922a);border:0;border-radius:10px;padding:10px 14px;font-weight:700;color:#1a1405;cursor:pointer;font-size:14px;flex:1}
.tvj-alt{background:none;border:1px solid #2c2860;border-radius:10px;padding:10px;color:#cfc8ea;cursor:pointer;font-size:13px}
.tvj-saved{font-size:13px;color:#cfc8ea}.tvj-saved b{color:#fff3c4}
.tvj-err{margin:0;color:#ff8a8a;font-size:12px}.tvj-priv{margin:0;color:#7d77a3;font-size:11px;text-align:center}
.tvj-ask{position:relative;display:flex;gap:6px;padding:10px;border-top:1px solid #2c2860;padding-bottom:max(10px,env(safe-area-inset-bottom))}
.tvj-ask input{flex:1;min-width:0;background:#0f0d2e;border:1px solid #2c2860;border-radius:10px;color:#efeaf9;padding:11px 10px;font-size:16px;outline:none}
.tvj-ask input:focus{border-color:#D4AF37}
.tvj-ask input.tvj-call{border-color:#D4AF37;animation:tvjCall 1.6s ease-in-out infinite}
.tvj-ask button{background:linear-gradient(180deg,#e6c454,#b8922a);border:0;border-radius:10px;padding:0 16px;font-weight:700;font-size:16px;color:#1a1405;cursor:pointer}
.tvj-ask button:disabled{opacity:.5;cursor:default}
.tvj-hint{position:absolute;left:14px;bottom:calc(100% + 4px);font-size:11.5px;color:#f3d77a;text-shadow:0 0 4px #000;pointer-events:none}
@media (prefers-reduced-motion:reduce){.tvj-dock *,.tvj-sheet *{animation-duration:.01ms!important;animation-iteration-count:1!important}}
`;
