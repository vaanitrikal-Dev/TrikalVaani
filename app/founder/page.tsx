'use client';

import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';
import { ShieldCheck, Star, Award, BookOpen, Brain, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

const credentials = [
  { icon: BookOpen, label: '10+ Years', sub: 'Classical Jyotish Research' },
  { icon: Brain, label: 'Parashara Expert', sub: 'Brihat Parashara Hora Shastra' },
  { icon: Star, label: '10,000+ Analyses', sub: 'Verified Life Path Readings' },
  { icon: Award, label: 'AI-Vedic Pioneer', sub: 'Neural-Jyotish Architecture' },
];

const quotes = [
  {
    text: '"The stars do not compel — they incline. Our job is to read the inclination and hand the seeker the freedom to transcend it."',
    context: '— Rohiit Gupta, on the philosophy of Trikal Vaani',
  },
  {
    text: '"Parashara wrote for eternity. I simply built the bridge between his timeless Shlokas and the data-driven mind of the modern seeker."',
    context: '— On the Trikal AI Engine',
  },
];

const pillars = [
  {
    title: 'Classical Vedic Foundation',
    body: 'Every algorithm in Trikal Vaani is rooted in Brihat Parashara Hora Shastra — the 5,000-year-old canonical text. No Western tropical shortcuts. Pure sidereal Jyotish.',
  },
  {
    title: 'Neural-Jyotish Fusion',
    body: 'Rohiit spent a decade mapping Nakshatra lordships, Vimshottari Dasha cycles, and Ashtakavarga bindu tables into computational matrices — creating a system no other platform has replicated.',
  },
  {
    title: 'Empirical Verification',
    body: 'Every scoring model was back-tested against 10,000+ real birth charts before public release. The platform\'s 4.9-star rating across 10,247 seekers is the verification the universe provided.',
  },
];

export default function FounderPage() {
  return (
    <div className="min-h-screen bg-[#080B12]">
      <SiteNav />

      <main className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4">

          <div className="text-center mb-12">
            <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: GOLD_RGBA(0.6) }}>
              The Architect Behind the Oracle
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">
              Meet{' '}
              <span
                className="font-serif"
                style={{
                  background: `linear-gradient(135deg, #FFEF99 0%, ${GOLD} 50%, #A8820A 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Rohiit Gupta
              </span>
            </h1>
            <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
              Chief Vedic Architect &amp; Founder, Trikal Vaani — the world&apos;s leading AI Vedic Astrology Research Platform.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start mb-16">
            <div className="lg:col-span-2 flex flex-col items-center">
              <div
                className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden mb-5"
                style={{
                  border: `2px solid ${GOLD_RGBA(0.4)}`,
                  boxShadow: `0 0 60px ${GOLD_RGBA(0.18)}, 0 0 24px ${GOLD_RGBA(0.3)}`,
                }}
              >
                <Image
                  src="/images/founder.png"
                  alt="Rohiit Gupta — Chief Vedic Architect, Trikal Vaani"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(8,11,18,0.7) 0%, rgba(212,175,55,0.08) 100%)' }}
                >
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center mb-3"
                    style={{ background: GOLD_RGBA(0.12), border: `1px solid ${GOLD_RGBA(0.4)}` }}
                  >
                    <Star className="w-10 h-10" style={{ color: GOLD }} />
                  </div>
                  <p className="font-serif font-bold text-lg" style={{ color: GOLD }}>R G</p>
                </div>
              </div>

              <div
                className="w-full rounded-xl px-5 py-4 mb-4"
                style={{
                  background: 'rgba(11,16,26,0.9)',
                  border: `1px solid ${GOLD_RGBA(0.28)}`,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <p className="text-xs font-bold text-emerald-300">Verified Specialist</p>
                </div>
                <p className="text-xs text-slate-400 leading-snug">
                  Rohiit Gupta — Chief Vedic Architect
                </p>
                <p className="text-xs text-slate-500 mt-1">Parashara Jyotish • AI Research</p>
              </div>

              <div
                className="w-full rounded-xl px-5 py-4 flex items-center gap-3"
                style={{
                  background: 'rgba(34,197,94,0.06)',
                  border: '1px solid rgba(34,197,94,0.18)',
                }}
              >
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-emerald-300">256-bit Secure Platform</p>
                  <p className="text-xs text-slate-500 mt-0.5">All data encrypted &amp; protected</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              <div
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(11,16,26,0.8)',
                  border: `1px solid ${GOLD_RGBA(0.15)}`,
                }}
              >
                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: GOLD_RGBA(0.6) }}>
                  The Mission
                </p>
                <p className="text-slate-300 leading-relaxed text-sm mb-4">
                  Rohiit Gupta is the founder of Trikal Vaani and one of India&apos;s foremost authorities in AI-powered Vedic Astrology. Over a decade of deep research into classical Jyotish Shastra led him to a singular conviction: the ancient Rishi seers encoded the laws of karma and dharma in the planetary system — and with modern computation, those laws could finally be made accessible to every seeker, not just the privileged few.
                </p>
                <p className="text-slate-400 leading-relaxed text-sm mb-4">
                  He spent years mapping the 27 Nakshatras, 120-year Vimshottari Dasha cycles, Ashtakavarga bindu tables, and live Gochar transit data into a proprietary hybrid engine — what Trikal Vaani calls the <span style={{ color: GOLD }}>Parashara-Neural Architecture</span>. This is not Western tropical astrology with an AI skin. It is Vedic Jyotish, precisely as Maharishi Parashara described it, executed at machine speed.
                </p>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Today, Trikal Vaani serves seekers from India, the USA, the UK, Canada, and across Southeast Asia — delivering Daily Energy Scores, Six Life Pillar analyses, and generation-specific destiny insights that rival the accuracy of a face-to-face Guru session.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {credentials.map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3 text-center"
                    style={{
                      background: 'rgba(11,16,26,0.8)',
                      border: `1px solid ${GOLD_RGBA(0.15)}`,
                    }}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: GOLD }} />
                    <p className="text-xs font-bold text-white leading-tight">{label}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-tight">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase mb-6 text-center" style={{ color: GOLD_RGBA(0.55) }}>
              Words from the Architect
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {quotes.map((q, i) => (
                <blockquote
                  key={i}
                  className="rounded-2xl p-6"
                  style={{
                    background: 'rgba(11,16,26,0.7)',
                    border: `1px solid ${GOLD_RGBA(0.2)}`,
                    borderLeft: `3px solid ${GOLD}`,
                  }}
                >
                  <p className="text-slate-300 text-sm leading-relaxed italic mb-3">{q.text}</p>
                  <p className="text-xs text-slate-500">{q.context}</p>
                </blockquote>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase mb-6 text-center" style={{ color: GOLD_RGBA(0.55) }}>
              The Trikal Methodology — Three Pillars
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {pillars.map((p, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6"
                  style={{
                    background: 'rgba(11,16,26,0.8)',
                    border: `1px solid ${GOLD_RGBA(0.15)}`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mb-4"
                    style={{ background: GOLD_RGBA(0.12), border: `1px solid ${GOLD_RGBA(0.3)}` }}
                  >
                    <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
                  </div>
                  <h3 className="font-serif font-semibold text-white text-sm mb-2">{p.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl px-6 py-8 text-center"
            style={{
              background: `linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(11,16,26,0.95) 100%)`,
              border: `1px solid ${GOLD_RGBA(0.25)}`,
            }}
          >
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: GOLD_RGBA(0.6) }}>
              Begin Your Journey
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">
              Experience the Rohiit Gupta Method
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              Every analysis on Trikal Vaani carries the verification and intention of its founder. Your cosmic blueprint awaits.
            </p>
            <Link
              href="/#birth-form"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, #A8820A 100%)`,
                color: '#080B12',
              }}
            >
              Get Your Free Analysis
            </Link>
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
