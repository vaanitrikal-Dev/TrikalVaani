import Link from 'next/link';
import { Star, MapPin, Instagram, ExternalLink, Mail, ShieldCheck } from 'lucide-react';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

export default function SiteFooter() {
  return (
    <footer
      className="px-4 pt-14 pb-8"
      style={{ borderTop: `1px solid ${GOLD_RGBA(0.1)}` }}
    >
      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${GOLD_RGBA(0.18)} 0%, rgba(11,16,26,0.8) 100%)`,
                  border: `1px solid ${GOLD_RGBA(0.3)}`,
                }}
              >
                <Star className="w-4 h-4" style={{ color: GOLD }} />
              </div>
              <span className="font-serif font-bold text-lg text-gradient-gold">
                Trikal Vaani
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mb-4">
              The world&apos;s leading Vedic AI Astrology Research Platform. Merging 5,000 years
              of Parashara wisdom with Neural Networks to decode your cosmic blueprint.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD_RGBA(0.5) }} />
              <span>Trikal Vaani Global Headquarters — Delhi NCR, India</span>
            </div>
            <p className="text-xs text-slate-600 pl-5">
              Founded by{' '}
              <Link href="/founder" style={{ color: GOLD_RGBA(0.8) }} className="font-semibold hover:text-white transition-colors">
                Rohiit Gupta
              </Link>
              , Chief Vedic Architect
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: GOLD_RGBA(0.55) }}>
              Explore
            </p>
            <nav className="flex flex-col gap-2.5">
              <Link href="/#pillars" className="text-xs transition-colors hover:text-white" style={{ color: GOLD_RGBA(0.65) }}>
                Life Pillars
              </Link>
              <Link href="/#birth-form" className="text-xs transition-colors hover:text-white" style={{ color: GOLD_RGBA(0.65) }}>
                Free Analysis
              </Link>
              <Link href="/blog" className="text-xs transition-colors hover:text-white" style={{ color: GOLD_RGBA(0.65) }}>
                Vedic Blog
              </Link>
              <Link href="/founder" className="text-xs transition-colors hover:text-white" style={{ color: GOLD_RGBA(0.65) }}>
                About Rohiit Gupta
              </Link>
              <Link href="/upcoming-events" className="text-xs transition-colors hover:text-white" style={{ color: GOLD_RGBA(0.65) }}>
                Festival Calendar
              </Link>
              <Link href="/#pricing" className="text-xs transition-colors hover:text-white" style={{ color: GOLD_RGBA(0.65) }}>
                Pricing
              </Link>
              <Link href="/my-cosmic-records" className="text-xs transition-colors hover:text-white" style={{ color: GOLD_RGBA(0.65) }}>
                My Cosmic Records
              </Link>
            </nav>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: GOLD_RGBA(0.55) }}>
              Research
            </p>
            <nav className="flex flex-col gap-2.5">
              <Link
                href="/#about"
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5"
              >
                Research &amp; Methodology
                <ExternalLink className="w-3 h-3 opacity-50" />
              </Link>
              <Link href="/blog/vedic-astrology-vs-western-astrology" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Vedic vs Western Astrology
              </Link>
              <Link href="/blog/shani-gochar-2024-saturn-transit" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Shani Gochar 2024
              </Link>
              <Link href="/blog/rahu-ketu-axis-2024-karmic-shift" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Rahu-Ketu Transit 2024
              </Link>
            </nav>

            <p className="text-xs font-semibold tracking-widest uppercase mt-6 mb-3" style={{ color: GOLD_RGBA(0.55) }}>
              Connect
            </p>
            <a
              href="https://www.instagram.com/trikalvaani"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              @trikalvaani
            </a>
          </div>
        </div>

        <div
          className="mb-8 rounded-2xl px-5 py-5"
          style={{
            background: 'rgba(11,16,26,0.7)',
            border: `1px solid ${GOLD_RGBA(0.18)}`,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: GOLD_RGBA(0.55) }}>
                Contact Support
              </p>
              <p className="text-sm leading-relaxed">
                For queries:{' '}
                <a
                  href="mailto:vaanitrikal@gmail.com"
                  className="inline-flex items-center gap-1.5 font-bold transition-all duration-200 hover:scale-105 hover:brightness-110"
                  style={{
                    color: '#FFF0A0',
                    background: `linear-gradient(135deg, ${GOLD_RGBA(0.18)} 0%, ${GOLD_RGBA(0.10)} 100%)`,
                    border: `1.5px solid ${GOLD_RGBA(0.55)}`,
                    borderRadius: '8px',
                    padding: '5px 14px 5px 10px',
                    textDecoration: 'none',
                    boxShadow: `0 0 22px ${GOLD_RGBA(0.28)}, inset 0 1px 0 ${GOLD_RGBA(0.18)}`,
                    letterSpacing: '0.02em',
                    fontSize: '0.875rem',
                  }}
                >
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD }} />
                  vaanitrikal@gmail.com
                </a>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Chief Vedic Architect:{' '}
                <Link href="/founder" style={{ color: GOLD_RGBA(0.75) }} className="font-semibold hover:text-white transition-colors">Rohiit Gupta</Link>
              </p>
            </div>
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl flex-shrink-0"
              style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)' }}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-300 leading-tight">256-bit Encrypted AI Prediction</p>
                <p className="text-xs text-slate-500 leading-tight mt-0.5">Verified by Rohiit Gupta</p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="pt-6 flex flex-col gap-4"
          style={{ borderTop: `1px solid ${GOLD_RGBA(0.07)}` }}
        >
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2">
            <Link
              href="/terms"
              className="text-xs font-bold transition-all duration-200 hover:text-white hover:scale-105"
              style={{ color: GOLD }}
            >
              Terms of Service
            </Link>
            <span style={{ color: GOLD_RGBA(0.3) }} className="text-xs">·</span>
            <Link
              href="/privacy"
              className="text-xs font-bold transition-all duration-200 hover:text-white hover:scale-105"
              style={{ color: GOLD }}
            >
              Privacy Policy
            </Link>
            <span style={{ color: GOLD_RGBA(0.3) }} className="text-xs">·</span>
            <Link
              href="/refund"
              className="text-xs font-bold transition-all duration-200 hover:text-white hover:scale-105"
              style={{ color: GOLD }}
            >
              Refund Policy
            </Link>
            <span style={{ color: GOLD_RGBA(0.3) }} className="text-xs">·</span>
            <Link
              href="/upcoming-events"
              className="text-xs font-bold transition-all duration-200 hover:text-white hover:scale-105"
              style={{ color: GOLD }}
            >
              Festival Calendar
            </Link>
            <span style={{ color: GOLD_RGBA(0.3) }} className="text-xs">·</span>
            <Link
              href="/founder"
              className="text-xs font-bold transition-all duration-200 hover:text-white hover:scale-105"
              style={{ color: GOLD }}
            >
              About the Founder
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700">
              <span>&copy; {new Date().getFullYear()} Trikal Vaani Global. All rights reserved.</span>
              <span style={{ color: GOLD_RGBA(0.2) }}>·</span>
              <span>Accurate AI Astrology</span>
              <span style={{ color: GOLD_RGBA(0.2) }}>·</span>
              <span>Vedic Shastra AI</span>
            </div>
            <p className="text-xs text-slate-700 text-center sm:text-right max-w-sm leading-relaxed">
              For educational &amp; research purposes. Not a substitute for professional advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
