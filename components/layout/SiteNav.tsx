import Link from 'next/link';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

function GoldOwlLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Trikal Vaani owl logo">
      <defs>
        <radialGradient id="owlBodyGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#F5E27A" />
          <stop offset="60%" stopColor={GOLD} />
          <stop offset="100%" stopColor="#7A5800" />
        </radialGradient>
        <radialGradient id="owlEyeGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFBE0" />
          <stop offset="100%" stopColor="#FACC15" />
        </radialGradient>
      </defs>
      <path d="M10 29 Q8 22 10 16 Q13 10 17 9 L24 7 L31 9 Q35 10 38 16 Q40 22 38 29 Q24 36 10 29Z" fill="url(#owlBodyGrad)" opacity="0.97" />
      <ellipse cx="24" cy="34" rx="11" ry="9" fill="url(#owlBodyGrad)" opacity="0.9" />
      <path d="M13 10 L10 4 L17 9 Z" fill={GOLD} opacity="0.9" />
      <path d="M35 10 L38 4 L31 9 Z" fill={GOLD} opacity="0.9" />
      <circle cx="18.5" cy="20" r="4.5" fill="rgba(2,8,23,0.92)" />
      <circle cx="29.5" cy="20" r="4.5" fill="rgba(2,8,23,0.92)" />
      <circle cx="18.5" cy="20" r="3" fill="url(#owlEyeGrad)" />
      <circle cx="29.5" cy="20" r="3" fill="url(#owlEyeGrad)" />
      <circle cx="19.5" cy="19.2" r="1.1" fill="rgba(2,8,23,0.88)" />
      <circle cx="30.5" cy="19.2" r="1.1" fill="rgba(2,8,23,0.88)" />
      <circle cx="20" cy="18.5" r="0.5" fill="rgba(255,255,255,0.75)" />
      <circle cx="31" cy="18.5" r="0.5" fill="rgba(255,255,255,0.75)" />
      <path d="M22 24 L24 22.5 L26 24 L24 26.5 Z" fill="#A8862A" opacity="0.95" />
    </svg>
  );
}

export default function SiteNav() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-4"
      style={{
        background: 'rgba(2,8,23,0.82)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${GOLD_RGBA(0.1)}`,
      }}
    >
      <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105"
            style={{
              background: `radial-gradient(circle, ${GOLD_RGBA(0.14)} 0%, rgba(2,8,23,0.5) 100%)`,
              border: `1px solid ${GOLD_RGBA(0.32)}`,
              boxShadow: `0 0 12px ${GOLD_RGBA(0.18)}`,
            }}
          >
            <GoldOwlLogo />
          </div>
          <span className="font-serif font-bold text-lg text-gradient-gold tracking-wide">
            Trikal Vaani
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/#pillars"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors duration-200"
          >
            Life Pillars
          </Link>
          <Link
            href="/blog"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors duration-200"
          >
            Vedic Blog
          </Link>
          <Link
            href="/#birth-form"
            className="text-sm font-medium px-4 py-2 rounded-full transition-all duration-300"
            style={{
              background: GOLD_RGBA(0.1),
              border: `1px solid ${GOLD_RGBA(0.28)}`,
              color: GOLD,
            }}
          >
            Free Analysis
          </Link>
        </nav>

        <Link
          href="/#birth-form"
          className="sm:hidden text-sm font-medium px-4 py-2 rounded-full transition-all duration-300"
          style={{
            background: GOLD_RGBA(0.1),
            border: `1px solid ${GOLD_RGBA(0.28)}`,
            color: GOLD,
          }}
        >
          Start
        </Link>
      </div>
    </header>
  );
}
