'use client';
/**
 * ============================================================================
 * FILE   : components/TrikalPicker.tsx
 * VERSION: v1.0
 * DATE   : 18 September 2026
 * ============================================================================
 *
 * WHAT IT IS
 *   A narrow fluorescent-orange tab stuck to the RIGHT EDGE, vertically
 *   centred, on every page. Tapping it slides out a drawer that helps a
 *   visitor find the right Trikaal Vaani tool — or reach Rohiit on WhatsApp.
 *
 * DESIGN DECISIONS, AND WHY (all agreed with Rohiit 18 Sep 2026)
 *
 *   VERTICAL, 34px WIDE — the gold TrikalVoice pill is horizontal and eats
 *     most of the width on a phone. A second horizontal pill would leave the
 *     visitor looking at two widgets and no website. Vertical costs ~9%.
 *
 *   VERTICALLY CENTRED, RIGHT EDGE — nowhere near TrikalVoice at bottom-right,
 *     and closest to the thumb on mobile. In June 2026 a second fixed element
 *     (StickyMobileCTA v1.0) covered the form submit button on mobile and
 *     clients could not submit; that component is now a no-op. This widget
 *     deliberately never sits at the bottom of the screen.
 *
 *   FIXED TAB HEIGHT — the label rotates between taglines. If the tab resized
 *     with each one it would visibly jump. Height is locked and every tagline
 *     is written short enough to fit.
 *
 *   ORANGE ON A GOLD SITE — a CTA colour should appear nowhere else on the
 *     page. Dark text on orange (not white) for real contrast; white on orange
 *     fails WCAG at this size.
 *
 *   NEVER AUTO-OPENS — on a marketing page an auto-opening widget reads as
 *     insecurity and gets dismissed. It opens on tap only.
 *
 *   NO PRODUCT COUNT SHOWN — "50+" would be untrue (there are 48) and a count
 *     changes no one's decision. The footer offers an action instead.
 *
 *   NO PRICES — the picker sends the visitor to the page; the page owns the
 *     price. One source of truth, so nothing here can go stale.
 *
 * WHERE THE PRODUCTS COME FROM
 *   GET /api/catalog — generated at build time from the repo's own folders.
 *   Add app/calculators/free-new-thing/ and it appears here automatically.
 *   Fetched on FIRST OPEN, not on page load, so it costs nothing to visitors
 *   who never tap.
 *
 * TURNING IT OFF
 *   Set NEXT_PUBLIC_DISABLE_PICKER=true in Vercel. Default is ON, so a missing
 *   env var shows the widget rather than hiding it.
 *
 * MOUNTED IN: app/layout.tsx (beside <TrikalVoice />)
 * ============================================================================
 */

import { useEffect, useRef, useState } from 'react';
import {
  CATEGORIES,
  searchProducts,
  productsByCategory,
  type CatalogProduct,
  type ProductCategory,
} from '@/lib/product-catalog';

/* ── Brand ──────────────────────────────────────────────────────────────── */
const ORANGE       = '#FF5A00';
const ORANGE_LIGHT = '#FF8A2B';
const ON_ORANGE    = '#1A0A00';   // dark text — passes contrast, white does not
const PANEL_BG     = '#16122A';
const PANEL_DEEP   = '#0D0B1A';
const ROW_BG       = '#221B3A';
const BORDER       = '#33294D';
const CREAM        = '#F0E9D6';
const GOLD_SOFT    = '#E9C978';
const MUTED        = '#8A8199';
const WA_GREEN     = '#2F9E5D';

const WHATSAPP_URL = 'https://wa.me/AskTrikaalVaani';

/** Keep these roughly equal in length — the tab height is fixed. */
const TAGLINES = [
  'Kya dhoond rahe hain?',
  'Main madad karun?',
  'Apni samasya batayein',
  'Sahi tool chunein',
  'Kya chahiye aapko?',
];

/**
 * Shown at the top of the drawer, above the categories.
 * Rohiit's picks, 18 Sep 2026 — highest-intent products first.
 */
const PRIORITY_HREFS = [
  '/calculators/free-janam-kundali-calculator',
  '/kundali-milan',
  '/calculators/free-sade-sati-calculator',
  '/calculators/free-shadi-kab-hogi-calculator',
  '/hast-rekha-calculator',
];

const PRIORITY_FALLBACK: CatalogProduct[] = [
  { href: '/calculators/free-janam-kundali-calculator', name: 'Janm Kundali Online',   category: 'kundali',  keywords: '' },
  { href: '/kundali-milan',                             name: 'Kundali Milan',         category: 'marriage', keywords: '' },
  { href: '/calculators/free-sade-sati-calculator',     name: 'Sade Sati Calculator',  category: 'dosha',    keywords: '' },
  { href: '/calculators/free-shadi-kab-hogi-calculator',name: 'Shadi Kab Hogi',        category: 'marriage', keywords: '' },
  { href: '/hast-rekha-calculator',                     name: 'Hast Rekha Reading',    category: 'other',    keywords: '' },
];

const CAT_EMOJI: Record<ProductCategory, string> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c.emoji }),
  {} as Record<ProductCategory, string>,
);

/** Meta Pixel / GA, only if the page already loaded them. Never throws. */
function track(event: string, detail: Record<string, unknown> = {}) {
  try {
    const w = window as unknown as {
      fbq?: (...a: unknown[]) => void;
      gtag?: (...a: unknown[]) => void;
    };
    w.fbq?.('trackCustom', event, detail);
    w.gtag?.('event', event, detail);
  } catch {
    /* analytics must never break the widget */
  }
}

export default function TrikalPicker() {
  if (process.env.NEXT_PUBLIC_DISABLE_PICKER === 'true') return null;

  const [open, setOpen]         = useState(false);
  const [tagIdx, setTagIdx]     = useState(0);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loaded, setLoaded]     = useState(false);
  const [query, setQuery]       = useState('');
  const [openCat, setOpenCat]   = useState<ProductCategory | null>(null);
  const searchRef               = useRef<HTMLInputElement>(null);

  /* Rotate the tab label. Pauses while the drawer is open. */
  useEffect(() => {
    if (open) return;
    const t = setInterval(() => setTagIdx((i) => (i + 1) % TAGLINES.length), 4000);
    return () => clearInterval(t);
  }, [open]);

  /* Load the catalog on FIRST open only. */
  useEffect(() => {
    if (!open || loaded) return;
    let alive = true;
    (async () => {
      try {
        const res  = await fetch('/api/catalog');
        const data = await res.json();
        if (alive && Array.isArray(data?.products)) setProducts(data.products);
      } catch {
        /* drawer still works — categories just come back empty */
      } finally {
        if (alive) setLoaded(true);
      }
    })();
    return () => { alive = false; };
  }, [open, loaded]);

  /* Escape closes. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
    track('PickerOpen', { path: typeof window !== 'undefined' ? window.location.pathname : '' });
    setTimeout(() => searchRef.current?.focus(), 350);
  };

  const close = () => { setOpen(false); setQuery(''); setOpenCat(null); };

  const goTo = (p: CatalogProduct, source: string) => {
    track('PickerProductClick', { product: p.href, via: source });
    window.location.href = p.href;
  };

  const results  = query.trim().length >= 2 ? searchProducts(products, query) : [];
  const priority = products.length
    ? PRIORITY_HREFS.map((h) => products.find((p) => p.href === h)).filter(Boolean) as CatalogProduct[]
    : PRIORITY_FALLBACK;

  /* ── Row used by every product list ─────────────────────────────────── */
  const Row = ({ p, via }: { p: CatalogProduct; via: string }) => (
    <button
      onClick={() => goTo(p, via)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
        textAlign: 'left', background: ROW_BG, color: CREAM,
        borderLeft: `2px solid ${ORANGE}`, border: 'none',
        borderRadius: '0 7px 7px 0', padding: '9px 10px',
        fontSize: 12.5, cursor: 'pointer', lineHeight: 1.3,
      }}
    >
      <span style={{ flex: 'none' }}>{CAT_EMOJI[p.category] ?? '✨'}</span>
      <span>{p.name}</span>
    </button>
  );

  return (
    <>
      {/* ── THE TAB ──────────────────────────────────────────────────── */}
      {!open && (
        <button
          onClick={handleOpen}
          aria-label="Sahi Trikaal Vaani tool dhoondhein"
          style={{
            position: 'fixed', right: 0, top: '50%', transform: 'translateY(-50%)',
            zIndex: 9990,
            width: 34, height: 158,
            background: `linear-gradient(180deg, ${ORANGE}, ${ORANGE_LIGHT})`,
            borderRadius: '10px 0 0 10px',
            border: 'none',
            boxShadow: `-3px 0 16px ${ORANGE}80`,
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', paddingTop: 10, gap: 7,
            animation: 'tvPickerGlow 3s ease-in-out infinite',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke={ON_ORANGE} strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
            <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span style={{
            writingMode: 'vertical-rl', transform: 'rotate(180deg)',
            fontSize: 11.5, fontWeight: 800, color: ON_ORANGE,
            letterSpacing: '.3px', whiteSpace: 'nowrap',
          }}>
            {TAGLINES[tagIdx]}
          </span>
        </button>
      )}

      {/* ── BACKDROP ─────────────────────────────────────────────────── */}
      {open && (
        <div
          onClick={close}
          style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,.55)' }}
        />
      )}

      {/* ── DRAWER ───────────────────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-label="Trikaal Vaani product picker"
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9999,
            width: '75%', maxWidth: 340,
            background: PANEL_BG,
            borderLeft: `1px solid ${ORANGE}`,
            display: 'flex', flexDirection: 'column',
            boxShadow: '-12px 0 40px rgba(0,0,0,.6)',
            animation: 'tvPickerIn .25s ease-out',
          }}
        >
          {/* header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px',
            background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_LIGHT})`,
          }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: ON_ORANGE }}>
              Main aapki madad karun?
            </span>
            <button onClick={close} aria-label="Band karein"
              style={{ background: 'none', border: 'none', cursor: 'pointer', lineHeight: 0, padding: 4 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                   stroke={ON_ORANGE} strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* scrolling body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>

            {/* search */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: PANEL_DEEP, border: `1px solid ${ORANGE}66`,
              borderRadius: 9, padding: '9px 11px', marginBottom: 14,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                   stroke={ORANGE_LIGHT} strokeWidth="2.4" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.7" y2="16.7" />
              </svg>
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="shadi, naukri, bachcha…"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: CREAM, fontSize: 12.5,
                }}
              />
            </div>

            {/* search results */}
            {query.trim().length >= 2 && (
              <div style={{ marginBottom: 14 }}>
                {results.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {results.map((p) => <Row key={p.href} p={p} via="search" />)}
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>
                    Kuch nahi mila. Neeche WhatsApp par seedha poochh lijiye.
                  </p>
                )}
              </div>
            )}

            {/* priority + categories, hidden while searching */}
            {query.trim().length < 2 && (
              <>
                <p style={{
                  fontSize: 10, fontWeight: 800, color: ORANGE_LIGHT,
                  letterSpacing: '.7px', margin: '0 0 7px',
                }}>
                  SABSE ZYADA POOCHHA JATA HAI
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {priority.map((p) => <Row key={p.href} p={p} via="priority" />)}
                </div>

                <p style={{
                  fontSize: 10, fontWeight: 800, color: MUTED,
                  letterSpacing: '.7px', margin: '0 0 7px',
                }}>
                  YA CATEGORY CHUNEIN
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {CATEGORIES.map((c) => {
                    const inCat  = productsByCategory(products, c.id);
                    const isOpen = openCat === c.id;
                    if (loaded && inCat.length === 0) return null;
                    return (
                      <div key={c.id}>
                        <button
                          onClick={() => setOpenCat(isOpen ? null : c.id)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            width: '100%', background: '#1F1A36', color: GOLD_SOFT,
                            border: `1px solid ${BORDER}`, borderRadius: 7,
                            padding: '9px 11px', fontSize: 12, cursor: 'pointer',
                          }}
                        >
                          <span>{c.emoji}&nbsp; {c.label}</span>
                          <span style={{ color: MUTED, fontSize: 11 }}>{isOpen ? '−' : '+'}</span>
                        </button>

                        {isOpen && (
                          <div style={{
                            display: 'flex', flexDirection: 'column', gap: 5,
                            marginTop: 6, marginLeft: 8,
                          }}>
                            {inCat.map((p) => <Row key={p.href} p={p} via={`cat:${c.id}`} />)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!loaded && (
                  <p style={{ fontSize: 11.5, color: MUTED, marginTop: 10 }}>Load ho raha hai…</p>
                )}
              </>
            )}
          </div>

          {/* WhatsApp footer — always visible */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('PickerWhatsApp', {
              path: typeof window !== 'undefined' ? window.location.pathname : '',
            })}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px', borderTop: `1px solid #2A2340`,
              background: '#121020', textDecoration: 'none',
            }}
          >
            <span style={{
              width: 30, height: 30, borderRadius: '50%', background: WA_GREEN,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                <path d="M17.5 14.4c-.3-.2-1.7-.9-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1a8 8 0 0 1-4-3.5c-.2-.4.2-.4.5-1 .1-.2 0-.4 0-.6l-.9-2.1c-.2-.5-.4-.5-.6-.5h-.6c-.2 0-.6.1-.9.4-.3.4-1.1 1.1-1.1 2.7s1.2 3.1 1.3 3.3a12 12 0 0 0 4.7 4.1c1.7.7 2.4.8 3.2.7.5-.1 1.7-.7 1.9-1.4.3-.7.3-1.2.2-1.4z"/>
              </svg>
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: '#7FD4A2' }}>
                Rohiit ji se seedha baat karein
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#3B9EFF" aria-hidden="true">
                  <path d="M12 2l2.4 1.8 3-.3 1 2.8 2.6 1.5-1 2.9 1 2.9-2.6 1.5-1 2.8-3-.3L12 22l-2.4-1.8-3 .3-1-2.8L3 16.2l1-2.9-1-2.9 2.6-1.5 1-2.8 3 .3z"/>
                  <path d="M10.6 14.6l-2.2-2.2 1.1-1.1 1.1 1.1 3.9-3.9 1.1 1.1z" fill="#121020"/>
                </svg>
              </span>
              <span style={{ display: 'block', fontSize: 10.5, color: '#6F667F' }}>
                Meta verified · wa.me/AskTrikaalVaani
              </span>
            </span>
          </a>
        </div>
      )}

      <style>{`
        @keyframes tvPickerGlow {
          0%, 100% { box-shadow: -3px 0 16px ${ORANGE}80; }
          50%      { box-shadow: -3px 0 26px ${ORANGE}cc; }
        }
        @keyframes tvPickerIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
