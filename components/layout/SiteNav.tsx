'use client';

// ============================================================
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// FILE: components/layout/SiteNav.tsx
// VERSION: v3.1
// DATE: 2026-10-18
// CHANGES:
//   v3.1: "Panchang" becomes a DROPDOWN (Rohiit approved 18 Oct 2026):
//     ├─ आज का पंचांग    → /panchang
//     └─ त्योहार कैलेंडर → /events  (new festival hub, app/events/page.tsx v1.0)
//     Desktop: opens on hover AND on click/tap of the chevron (tablets have
//     no hover); closes on outside click, Escape, or route change. The word
//     "Panchang" itself still links to /panchang, so nothing old breaks.
//     Mobile menu: "Panchang" heading with the two links indented under it.
//     Panchang is gold (active) on /panchang/* AND /events/*.
//     NAV_LINKS stays the single source of truth (optional `children`).
//     PROTECTED (unchanged): every other link, logo, LangSwitcher,
//     Sign In / My Vault, Free Analysis, hamburger, AuthModal, styling.
//   v3.0: Added "Hast Rekha" nav link (/hast-rekha-calculator), placed
//     immediately after Vivah Muhurat with the other reading products.
//     Reason: AI Hast Rekha is a PAID ₹51 product, so it was removed from
//     the free Calculators hub (calculators/page.tsx v3.7) and promoted to
//     primary navigation as a sales entry point. NAV_LINKS is the single
//     source of truth, so the desktop bar and mobile menu both pick it up.
//     Desktop gap tightened 4 → 3.5 (gap-x-3.5) to absorb the extra link
//     without wrapping. Nothing else changed. PROTECTED (unchanged): logo,
//     LangSwitcher, Sign In / My Vault, mobile hamburger, AuthModal, all
//     other routes + styling.
//   v2.9: Added "Swapna Shastra" nav link (/swapna) — free Vedic dream
//     interpretation product, grouped with the reading products (after
//     Karmic Reading).
//   v2.8: NAV CONSISTENCY PASS (style + colour) —
//     - Uniform link colour: every nav link is the same slate tone and
//       weight. Gold now means ONE thing: hover + current page.
//     - Active-page highlight via usePathname.
//     - Removed the email address from the DESKTOP top bar (kept in mobile).
//     - Single gold accent on desktop = the "Free Analysis" CTA button.
//   v2.7: Removed "Life Pillars" nav link (section still on homepage).
//   v2.6: Added "Vivah Muhurat" nav link.
//   v2.5: IR-0 cleanup - visible logo text "Trikaal Vaani".
//   v2.4: MOBILE HAMBURGER MENU.
//   v2.3: Added "Kundali Milan" + "Karmic Reading" links.
//   v2.2: Removed "Events"; added "Calculators".
// ============================================================

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Mail, User, ChevronDown, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/auth/AuthModal';
import { LANG_LABELS, LANG_NAMES, type Lang } from '@/lib/lang';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

// Single source of truth for nav links (desktop + mobile share this)
// v2.8: uniform styling - no per-item highlight flag.
// v2.9: added Swapna Shastra (/swapna) with the reading products.
// v3.0: added Hast Rekha (/hast-rekha-calculator) — paid ₹51 palm reading.
// v3.1: Panchang carries children → rendered as a dropdown.
type NavLink = { href: string; label: string; children?: { href: string; label: string }[] };

const NAV_LINKS: NavLink[] = [
  { href: '/services',                  label: 'Services' },
  { href: '/kundali-milan',             label: 'Kundali Milan' },
  { href: '/vivah-muhurat',             label: 'Vivah Muhurat' },
  { href: '/hast-rekha-calculator',     label: 'Hast Rekha' },
  { href: '/karmic-background-reading', label: 'Karmic Reading' },
  { href: '/swapna',                    label: 'Swapna Shastra' },
  {
    href: '/panchang', label: 'Panchang',
    children: [
      { href: '/panchang', label: 'आज का पंचांग' },
      { href: '/events',   label: 'त्योहार कैलेंडर' },
    ],
  },
  { href: '/calculators',               label: 'Calculators' },
  { href: '/blog',                      label: 'Vedic Blog' },
  { href: '/founder',                   label: 'Founder' },
];

function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors hover:bg-white/5"
        style={{ color: GOLD_RGBA(0.8), border: `1px solid ${GOLD_RGBA(0.15)}` }}
      >
        {LANG_LABELS[lang]}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 rounded-xl overflow-hidden z-50 min-w-[110px]"
          style={{ background: 'rgba(11,16,26,0.98)', border: `1px solid ${GOLD_RGBA(0.2)}`, boxShadow: `0 8px 32px rgba(0,0,0,0.5)` }}
        >
          {(Object.entries(LANG_NAMES) as [Lang, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setLang(key); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-xs transition-colors hover:bg-white/5"
              style={{ color: lang === key ? GOLD : '#94a3b8' }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// v3.1 — desktop dropdown for a link with children (Panchang).
function NavDropdown({
  link, active, isActive, pathname,
}: {
  link: NavLink; active: boolean; isActive: (href: string) => boolean; pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // close after navigating
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="flex items-center gap-0.5">
        <Link
          href={link.href}
          aria-current={active ? 'page' : undefined}
          className={`text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
            active ? 'text-[#D4AF37]' : 'text-slate-300 hover:text-[#D4AF37]'
          }`}
        >
          {link.label}
        </Link>
        <button
          type="button"
          aria-label={`${link.label} menu`}
          aria-expanded={open}
          aria-haspopup="true"
          onClick={() => setOpen((o) => !o)}
          className={`p-0.5 transition-colors ${active ? 'text-[#D4AF37]' : 'text-slate-400 hover:text-[#D4AF37]'}`}
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open && (
        // pt-2 bridges the gap so the menu does not close while the mouse moves down
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
          <div
            className="rounded-xl overflow-hidden min-w-[170px] py-1"
            style={{ background: 'rgba(11,16,26,0.98)', border: `1px solid ${GOLD_RGBA(0.2)}`, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
          >
            {link.children!.map((c) => {
              const on = pathname === c.href || (c.href !== '/panchang' && isActive(c.href));
              return (
                <Link
                  key={c.href}
                  href={c.href}
                  aria-current={on ? 'page' : undefined}
                  className="block px-4 py-2.5 text-sm whitespace-nowrap transition-colors hover:bg-white/5"
                  style={{ color: on ? GOLD : '#cbd5e1' }}
                >
                  {c.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SiteNav() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const [mobileOpen, setMobileOpen] = useState(false);

  const pathname = usePathname();
  // Active if exact match or a sub-page of the link (e.g. /services/ex-back-reading)
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');
  // v3.1: a parent with children is active when any child route is active
  const isLinkActive = (l: NavLink) =>
    isActive(l.href) || (l.children ?? []).some((c) => isActive(c.href));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 px-4"
        style={{
          background: 'rgba(2,8,23,0.82)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${GOLD_RGBA(0.1)}`,
        }}
      >
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">

          {/* -- LOGO -- */}
          <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
            <div
              className="rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 overflow-hidden"
              style={{
                width: '52px',
                height: '52px',
                background: `radial-gradient(circle, ${GOLD_RGBA(0.16)} 0%, rgba(2,8,23,0.5) 100%)`,
                border: `1px solid ${GOLD_RGBA(0.35)}`,
                boxShadow: `0 0 22px ${GOLD_RGBA(0.38)}, 0 0 8px ${GOLD_RGBA(0.55)}`,
              }}
            >
              <Image
                src="/Trikal_Vaani_Logo.svg"
                alt="Trikaal Vaani Logo"
                width={60}
                height={60}
                priority
              />
            </div>
            <span className="font-serif font-bold text-lg text-gradient-gold tracking-wide">
              Trikaal Vaani
            </span>
          </Link>

          {/* -- DESKTOP NAV - v2.8: uniform colour + active-page gold -- */}
          {/* v3.0: gap 4 → 3.5 to fit the extra Hast Rekha link on one line. */}
          <nav className="hidden sm:flex items-center gap-3.5">

            {NAV_LINKS.map((l) =>
              l.children ? (
                <NavDropdown
                  key={l.href}
                  link={l}
                  active={isLinkActive(l)}
                  isActive={isActive}
                  pathname={pathname}
                />
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isActive(l.href) ? 'page' : undefined}
                  className={`text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                    isActive(l.href)
                      ? 'text-[#D4AF37]'
                      : 'text-slate-300 hover:text-[#D4AF37]'
                  }`}
                >
                  {l.label}
                </Link>
              )
            )}

            <LangSwitcher lang={lang} setLang={setLang} />

            {user ? (
              <Link
                href="/my-cosmic-records"
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full transition-all duration-300 hover:scale-105"
                style={{
                  background: GOLD_RGBA(0.1),
                  border: `1px solid ${GOLD_RGBA(0.28)}`,
                  color: GOLD,
                }}
              >
                <User className="w-3.5 h-3.5" />
                My Vault
              </Link>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-sm font-medium px-3 py-2 rounded-full transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8',
                }}
              >
                Sign In
              </button>
            )}

            <Link
              href="/#birth-form"
              className="text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`,
                color: '#080B12',
              }}
            >
              Free Analysis
            </Link>
          </nav>

          {/* -- MOBILE: Start button + hamburger -- */}
          <div className="sm:hidden flex items-center gap-2">
            <Link
              href="/#birth-form"
              className="text-sm font-medium px-4 py-2 rounded-full transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`,
                color: '#080B12',
              }}
              onClick={() => setMobileOpen(false)}
            >
              Start
            </Link>
            <button
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((o) => !o)}
              className="flex items-center justify-center rounded-lg transition-colors"
              style={{
                width: '40px',
                height: '40px',
                color: GOLD,
                border: `1px solid ${GOLD_RGBA(0.25)}`,
                background: GOLD_RGBA(0.06),
              }}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* -- MOBILE DROPDOWN MENU -- */}
      {mobileOpen && (
        <>
          {/* backdrop */}
          <div
            className="fixed inset-0 z-40 sm:hidden"
            style={{ background: 'rgba(0,0,0,0.6)', top: '64px' }}
            onClick={() => setMobileOpen(false)}
          />
          {/* panel */}
          <nav
            className="fixed left-0 right-0 z-40 sm:hidden px-4 pb-6 pt-2"
            style={{
              top: '64px',
              background: 'rgba(2,8,23,0.98)',
              backdropFilter: 'blur(16px)',
              borderBottom: `1px solid ${GOLD_RGBA(0.15)}`,
              boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              maxHeight: 'calc(100vh - 64px)',
              overflowY: 'auto',
            }}
          >
            <div className="flex flex-col">
              {NAV_LINKS.map((l) =>
                l.children ? (
                  // v3.1: heading + indented child links
                  <div key={l.href} style={{ borderBottom: `1px solid ${GOLD_RGBA(0.08)}` }}>
                    <p
                      className={`pt-3.5 pb-1 text-base ${
                        isLinkActive(l) ? 'text-[#D4AF37] font-semibold' : 'text-slate-300'
                      }`}
                    >
                      {l.label}
                    </p>
                    {l.children.map((c) => {
                      const on = pathname === c.href || (c.href !== '/panchang' && isActive(c.href));
                      return (
                        <Link
                          key={c.href}
                          href={c.href}
                          onClick={() => setMobileOpen(false)}
                          aria-current={on ? 'page' : undefined}
                          className={`block py-2.5 pl-4 text-[15px] transition-colors ${
                            on ? 'text-[#D4AF37] font-semibold' : 'text-slate-400'
                          }`}
                        >
                          {c.label}
                        </Link>
                      );
                    })}
                    <div className="pb-1" />
                  </div>
                ) : (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive(l.href) ? 'page' : undefined}
                    className={`py-3.5 text-base transition-colors ${
                      isActive(l.href) ? 'text-[#D4AF37] font-semibold' : 'text-slate-300'
                    }`}
                    style={{ borderBottom: `1px solid ${GOLD_RGBA(0.08)}` }}
                  >
                    {l.label}
                  </Link>
                )
              )}

              {/* Sign In / My Vault */}
              {user ? (
                <Link
                  href="/my-cosmic-records"
                  onClick={() => setMobileOpen(false)}
                  className="py-3.5 text-base flex items-center gap-2"
                  style={{ color: GOLD, fontWeight: 600 }}
                >
                  <User className="w-4 h-4" /> My Vault
                </Link>
              ) : (
                <button
                  onClick={() => { setMobileOpen(false); setShowAuth(true); }}
                  className="py-3.5 text-base text-left text-slate-300"
                  style={{ borderBottom: `1px solid ${GOLD_RGBA(0.08)}` }}
                >
                  Sign In
                </button>
              )}

              {/* Language + email (email kept here - does not crowd the bar) */}
              <div className="flex items-center justify-between pt-4">
                <LangSwitcher lang={lang} setLang={setLang} />
                <a
                  href="mailto:rohiit@trikalvaani.com"
                  className="flex items-center gap-1.5 text-xs text-slate-500"
                >
                  <Mail className="w-3.5 h-3.5" style={{ color: GOLD_RGBA(0.5) }} />
                  rohiit@trikalvaani.com
                </a>
              </div>
            </div>
          </nav>
        </>
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={() => setShowAuth(false)}
        />
      )}
    </>
  );
}
