/**
 * ============================================================
 * TRIKAL VAANI — Result Client Component
 * CEO & Chief Vedic Architect: Rohiit Gupta
 * File: components/result/ResultClient.tsx
 * VERSION: 2.0 — Full prediction display, dual language, all tiers
 * SIGNED: ROHIIT GUPTA, CEO
 * ============================================================
 */

'use client';

import { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ResultMeta {
  personName:     string;
  domainId:       string;
  domainLabel:    string;
  tier:           string;
  lagna:          string;
  nakshatra:      string;
  mahadasha:      string;
  antardasha:     string;
  language:       string;
  confidenceLabel?: string;
  primaryYoga?:   string;
  processingMs?:  number;
  analysisDate?:  string;
}

interface ResultClientProps {
  predictionId:   string;
  predictionData: any;
  meta:           ResultMeta;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DOMAIN_ICONS: Record<string, string> = {
  genz_ex_back:            '💔',
  genz_toxic_boss:         '⚠️',
  genz_manifestation:      '✨',
  genz_dream_career:       '📈',
  mill_property_yog:       '🏠',
  mill_karz_mukti:         '💸',
  mill_childs_destiny:     '👶',
  mill_parents_wellness:   '👨‍👩‍👧',
  genx_retirement_peace:   '🌅',
  genx_legacy_inheritance: '👑',
  genx_spiritual_innings:  '🌙',
};

const TIER_COLORS: Record<string, string> = {
  free:     '#94a3b8',
  basic:    '#60a5fa',
  standard: '#D4AF37',
  premium:  '#f59e0b',
};

const CONFIDENCE_COLORS: Record<string, string> = {
  'Multi-Layer Verified ✓': '#22c55e',
  'Planetary Support Active': '#D4AF37',
  'Timing-Dependent': '#f59e0b',
  'Conditional — Check Timing': '#ef4444',
  'high':   '#22c55e',
  'medium': '#D4AF37',
  'low':    '#ef4444',
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function ResultClient({ predictionId, predictionData: p, meta }: ResultClientProps) {
  const [activeTab, setActiveTab] = useState<'simple' | 'english' | 'hindi'>('simple');
  const [copied, setCopied] = useState(false);

  const isPaid     = ['basic', 'standard', 'premium'].includes(meta.tier);
  const isStandard = ['standard', 'premium'].includes(meta.tier);
  const domainIcon = DOMAIN_ICONS[meta.domainId] ?? '🔮';
  const tierColor  = TIER_COLORS[meta.tier] ?? '#94a3b8';
  const confColor  = CONFIDENCE_COLORS[meta.confidenceLabel ?? ''] ?? '#D4AF37';

  const summary = p?.simpleSummary ?? {};
  const engReport = p?.professionalEnglish ?? {};
  const hinReport = p?.professionalHindi ?? {};
  const geoAnswer = p?.geoDirectAnswer ?? '';

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/result/${predictionId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `${meta.personName} ki Vedic Kundali reading dekho — Trikal Vaani dwara:\n` +
      `${window.location.origin}/result/${predictionId}\n` +
      `Powered by Swiss Ephemeris + BPHS 🔱`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen" style={{ background: '#080B12', color: '#e2e8f0' }}>

      {/* ── Header ── */}
      <div style={{ background: 'rgba(13,17,30,0.95)', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl">🔱</span>
            <span style={{ color: '#D4AF37', fontWeight: 700 }}>Trikal Vaani</span>
          </a>
          <div className="flex items-center gap-3">
            <button onClick={handleWhatsApp}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: '#25D366', color: '#fff' }}>
              📲 Share
            </button>
            <button onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
              {copied ? '✓ Copied' : '🔗 Copy Link'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* ── Person Card ── */}
        <div className="rounded-2xl p-6"
          style={{ background: 'linear-gradient(135deg, rgba(13,17,30,0.9), rgba(20,27,45,0.9))', border: '1px solid rgba(212,175,55,0.25)' }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{domainIcon}</span>
                <div>
                  <h1 className="text-xl font-bold text-white">{meta.personName}</h1>
                  <p style={{ color: '#D4AF37', fontSize: '0.85rem' }}>{meta.domainLabel} Reading</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { label: 'Lagna', value: meta.lagna },
                  { label: 'Nakshatra', value: meta.nakshatra },
                  { label: 'Mahadasha', value: meta.mahadasha },
                  { label: 'Antardasha', value: meta.antardasha },
                ].map(item => (
                  <div key={item.label} className="px-3 py-1 rounded-full text-xs"
                    style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37' }}>
                    <span style={{ color: '#64748b' }}>{item.label}: </span>{item.value}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right">
              {/* Confidence Badge */}
              {meta.confidenceLabel && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-2"
                  style={{ background: `${confColor}20`, border: `1px solid ${confColor}50`, color: confColor }}>
                  ✓ {meta.confidenceLabel}
                </div>
              )}
              {/* Karmic Marker */}
              {p?.professionalEnglish?.karmicMarker && (
                <div className="flex items-center justify-end gap-1 text-xs mt-1"
                  style={{ color: '#a78bfa' }}>
                  🔱 Karmic Indicator Active
                </div>
              )}
              {/* Tier badge */}
              <div className="mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: `${tierColor}20`, color: tierColor, border: `1px solid ${tierColor}40` }}>
                  {meta.tier.toUpperCase()} READING
                </span>
              </div>
            </div>
          </div>

          {/* Primary Yoga */}
          {meta.primaryYoga && (
            <div className="mt-4 pt-4 border-t border-amber-400/10">
              <p className="text-xs text-slate-500">Primary Yoga Active</p>
              <p className="text-sm font-medium" style={{ color: '#D4AF37' }}>✦ {meta.primaryYoga}</p>
            </div>
          )}
        </div>

        {/* ── Tab Selector ── */}
        <div className="flex gap-2 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { key: 'simple',  label: '📖 Summary',        show: true },
            { key: 'english', label: '🌐 Full Report',     show: isPaid },
            { key: 'hindi',   label: '🕉️ हिंदी रिपोर्ट', show: isStandard },
          ].filter(t => t.show).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.key ? 'rgba(212,175,55,0.2)' : 'transparent',
                color:      activeTab === tab.key ? '#D4AF37' : '#64748b',
                border:     activeTab === tab.key ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: SIMPLE SUMMARY ── */}
        {activeTab === 'simple' && (
          <div className="space-y-4">

            {/* Key Message */}
            {summary.keyMessage && (
              <div className="rounded-xl p-4 text-center"
                style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.3)' }}>
                <p className="text-sm" style={{ color: '#94a3b8' }}>Key Message</p>
                <p className="text-lg font-semibold mt-1 text-white">"{summary.keyMessage}"</p>
              </div>
            )}

            {/* Main Text */}
            {summary.text && (
              <div className="rounded-xl p-5"
                style={{ background: 'rgba(13,17,30,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">{summary.text}</p>
              </div>
            )}

            {/* Best Dates */}
            {summary.bestDates && (
              <div className="rounded-xl p-4"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: '#22c55e' }}>⭐ Best Dates</p>
                <p className="text-sm text-slate-300">{summary.bestDates}</p>
              </div>
            )}

            {/* Dos & Don'ts */}
            {(summary.dos?.length > 0 || summary.donts?.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {summary.dos?.length > 0 && (
                  <div className="rounded-xl p-4"
                    style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                    <p className="text-xs font-bold mb-3" style={{ color: '#22c55e' }}>✅ Karein (Do)</p>
                    <ul className="space-y-2">
                      {summary.dos.map((d: string, i: number) => (
                        <li key={i} className="text-xs text-slate-300 flex gap-2">
                          <span style={{ color: '#22c55e' }}>→</span>{d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.donts?.length > 0 && (
                  <div className="rounded-xl p-4"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <p className="text-xs font-bold mb-3" style={{ color: '#ef4444' }}>❌ Na Karein (Don't)</p>
                    <ul className="space-y-2">
                      {summary.donts.map((d: string, i: number) => (
                        <li key={i} className="text-xs text-slate-300 flex gap-2">
                          <span style={{ color: '#ef4444' }}>→</span>{d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Locked teaser for free */}
            {!isPaid && engReport?.locked && (
              <div className="rounded-xl p-6 text-center"
                style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02))', border: '1px dashed rgba(212,175,55,0.3)' }}>
                <div className="text-3xl mb-3">🔐</div>
                <p className="font-semibold text-white mb-2">Full Analysis Locked</p>
                <p className="text-sm text-slate-400 mb-4">{engReport.teaser}</p>
                <a href="/pricing"
                  className="inline-block px-6 py-2.5 rounded-lg text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D76E)', color: '#080B12' }}>
                  Unlock for {engReport.upgradePrice} →
                </a>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: ENGLISH REPORT ── */}
        {activeTab === 'english' && isPaid && !engReport?.locked && (
          <div className="space-y-5">

            {/* Executive Summary */}
            {engReport.executiveSummary && (
              <Section title="Executive Summary" icon="📋">
                <p className="text-sm leading-relaxed text-slate-300">{engReport.executiveSummary}</p>
              </Section>
            )}

            {/* Synthesis Score */}
            {engReport.synthesisScore && (
              <Section title="Analysis Confidence" icon="🎯">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold" style={{ color: confColor }}>
                    {engReport.synthesisScore.label}
                  </span>
                  <span className="text-xs text-slate-500">
                    {engReport.synthesisScore.agreementPoints} agreement
                  </span>
                </div>
                <p className="text-xs text-slate-400">{engReport.synthesisScore.actionGuidance}</p>
              </Section>
            )}

            {/* Dasha Analysis */}
            {engReport.dashaAnalysis && (
              <Section title="Current Planetary Period" icon="⏳">
                <DashaBlock dasha={engReport.dashaAnalysis} />
              </Section>
            )}

            {/* Key Influences */}
            {engReport.keyInfluences?.length > 0 && (
              <Section title="Planetary Influences" icon="🪐">
                <div className="space-y-3">
                  {engReport.keyInfluences.map((inf: any, i: number) => (
                    <PlanetCard key={i} influence={inf} />
                  ))}
                </div>
              </Section>
            )}

            {/* Yogas */}
            {engReport.yogasFound?.length > 0 && (
              <Section title="Active Yogas" icon="✦">
                <div className="space-y-3">
                  {engReport.yogasFound.map((yoga: any, i: number) => (
                    <YogaCard key={i} yoga={yoga} />
                  ))}
                </div>
              </Section>
            )}

            {/* Bhrigu Insights */}
            {engReport.bhriguInsights && (
              <Section title="🔱 Bhrigu Karmic Insights" icon="">
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">Current Life Theme</p>
                  <p className="text-sm font-medium text-amber-400">{engReport.bhriguInsights.currentLifeTheme}</p>
                  {engReport.bhriguInsights.karmicText && (
                    <p className="text-sm text-slate-300 mt-2">{engReport.bhriguInsights.karmicText}</p>
                  )}
                  <p className="text-sm text-slate-400 mt-2">{engReport.bhriguInsights.bhriguSummary}</p>
                </div>
              </Section>
            )}

            {/* Action + Avoid Windows */}
            {engReport.actionWindows?.length > 0 && (
              <Section title="Action Windows" icon="🟢">
                <div className="space-y-3">
                  {engReport.actionWindows.map((w: any, i: number) => (
                    <div key={i} className="rounded-lg p-3"
                      style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>{w.dateRange}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e' }}>{w.quality}</span>
                      </div>
                      <p className="text-sm text-slate-300">{w.action}</p>
                      <p className="text-xs text-slate-500 mt-1">{w.planetaryBasis}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {engReport.avoidWindows?.length > 0 && (
              <Section title="Caution Windows" icon="🔴">
                <div className="space-y-3">
                  {engReport.avoidWindows.map((w: any, i: number) => (
                    <div key={i} className="rounded-lg p-3"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <span className="text-xs font-semibold" style={{ color: '#ef4444' }}>{w.dateRange}</span>
                      <p className="text-sm text-slate-300 mt-1">{w.whatToAvoid}</p>
                      <p className="text-xs text-slate-500 mt-1">{w.reason}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Remedies */}
            {engReport.remedyPlan?.remedies?.length > 0 && (
              <Section title="Remedy Plan" icon="🕉️">
                <div className="space-y-4">
                  {engReport.remedyPlan.remedies.map((r: any, i: number) => (
                    <RemedyCard key={i} remedy={r} />
                  ))}
                </div>
              </Section>
            )}

            {/* Panchang */}
            {engReport.panchang?.vara && (
              <Section title="Today's Panchang" icon="📅">
                <PanchangBlock panchang={engReport.panchang} />
              </Section>
            )}

            {/* World Context */}
            {engReport.worldContext?.available && engReport.worldContext.summary && (
              <Section title="Current World Context" icon="🌍">
                <p className="text-sm text-slate-300">{engReport.worldContext.summary}</p>
                {engReport.worldContext.sources?.length > 0 && (
                  <p className="text-xs text-slate-600 mt-2">Sources: {engReport.worldContext.sources.join(', ')}</p>
                )}
              </Section>
            )}

            {/* Ashtakavarga */}
            {engReport.ashtakavargaAnalysis && (
              <Section title="Ashtakavarga Analysis" icon="📊">
                <p className="text-sm text-slate-300">{engReport.ashtakavargaAnalysis.interpretation}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {engReport.ashtakavargaAnalysis.strongHouses?.map((h: number) => (
                    <span key={h} className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                      House {h} ✦
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">{engReport.ashtakavargaAnalysis.classicalBasis}</p>
              </Section>
            )}

            {/* SEO Authority */}
            {engReport.seoSignals?.authorityStatement && (
              <div className="rounded-xl p-4 text-center"
                style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.1)' }}>
                <p className="text-xs text-slate-500">{engReport.seoSignals.authorityStatement}</p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: HINDI REPORT ── */}
        {activeTab === 'hindi' && isStandard && !hinReport?.locked && (
          <div className="space-y-5">

            {engReport.karmicMarker && (
              <div className="text-center py-2">
                <span className="text-sm px-3 py-1 rounded-full"
                  style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>
                  🔱 कार्मिक संकेत सक्रिय
                </span>
              </div>
            )}

            {hinReport.karyakariSarvekshan && (
              <Section title="कार्यकारी सारांश" icon="📋">
                <p className="text-sm leading-relaxed text-slate-300">{hinReport.karyakariSarvekshan}</p>
              </Section>
            )}

            {hinReport.sheershak && (
              <div className="rounded-xl p-4 text-center"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
                <p className="text-base font-semibold" style={{ color: '#D4AF37' }}>{hinReport.sheershak}</p>
              </div>
            )}

            {hinReport.dashaVishleshan && (
              <Section title="दशा विश्लेषण" icon="⏳">
                <div className="space-y-2">
                  {hinReport.dashaVishleshan.mahadasha && (
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-xs text-slate-500">महादशा</p>
                      <p className="text-sm text-white font-medium">{hinReport.dashaVishleshan.mahadasha.swami}</p>
                      <p className="text-sm text-slate-300 mt-1">{hinReport.dashaVishleshan.mahadasha.phalam}</p>
                    </div>
                  )}
                  {hinReport.dashaVishleshan.dashasar && (
                    <p className="text-sm text-slate-300 mt-2">{hinReport.dashaVishleshan.dashasar}</p>
                  )}
                </div>
              </Section>
            )}

            {hinReport.pramukhPrabha?.length > 0 && (
              <Section title="प्रमुख ग्रह प्रभाव" icon="🪐">
                <div className="space-y-3">
                  {hinReport.pramukhPrabha.map((g: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{g.graha}</span>
                        <span className="text-xs" style={{ color: '#D4AF37' }}>{g.sthiti}</span>
                      </div>
                      <p className="text-sm text-slate-300">{g.phalam}</p>
                      <p className="text-xs text-slate-600 mt-1">{g.shastraSandarb}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {hinReport.upayYojana?.upay?.length > 0 && (
              <Section title="उपाय योजना" icon="🕉️">
                <div className="space-y-4">
                  {hinReport.upayYojana.upay.map((u: any, i: number) => (
                    <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
                      <p className="font-semibold text-amber-400 mb-2">{u.graha} उपाय</p>
                      {u.mantra?.path && (
                        <div className="mb-2">
                          <p className="text-xs text-slate-500">मंत्र</p>
                          <p className="text-sm text-slate-300">{u.mantra.path}</p>
                          <p className="text-xs text-slate-500">{u.mantra.sankhya} बार | {u.mantra.var} | {u.mantra.samay}</p>
                        </div>
                      )}
                      {u.dan?.vastu && (
                        <div className="mb-2">
                          <p className="text-xs text-slate-500">दान</p>
                          <p className="text-sm text-slate-300">{u.dan.vastu} — {u.dan.var}</p>
                        </div>
                      )}
                      {u.karyaKaro?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold mb-1" style={{ color: '#22c55e' }}>करें ✅</p>
                          {u.karyaKaro.slice(0, 3).map((k: string, j: number) => (
                            <p key={j} className="text-xs text-slate-400">• {k}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {hinReport.panchang?.var && (
              <Section title="आज का पंचांग" icon="📅">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'वार', value: hinReport.panchang.var },
                    { label: 'तिथि', value: hinReport.panchang.tithi },
                    { label: 'नक्षत्र', value: hinReport.panchang.nakshatra },
                    { label: 'योग', value: hinReport.panchang.yoga },
                  ].map(item => (
                    <div key={item.label} className="p-2 rounded-lg text-center"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-sm text-white font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
                {hinReport.panchang.panchaangSalab && (
                  <p className="text-sm text-slate-300 mt-3">{hinReport.panchang.panchaangSalab}</p>
                )}
              </Section>
            )}
          </div>
        )}

        {/* ── Upgrade CTA (paid tabs locked) ── */}
        {activeTab === 'hindi' && !isStandard && (
          <UpgradeCTA price="₹99" message="हिंदी में पूर्ण विश्लेषण अनलॉक करें" />
        )}

        {/* ── New Reading CTA ── */}
        <div className="rounded-xl p-5 text-center"
          style={{ background: 'rgba(13,17,30,0.8)', border: '1px solid rgba(212,175,55,0.15)' }}>
          <p className="text-sm text-slate-400 mb-3">Doosra domain try karna chahte hain?</p>
          <a href="/"
            className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D76E)', color: '#080B12' }}>
            Naya Reading Shuru Karein 🔱
          </a>
        </div>

        {/* ── Footer ── */}
        <div className="text-center pb-8">
          <p className="text-xs text-slate-600">
            Powered by Swiss Ephemeris + BPHS | Rohiit Gupta, Chief Vedic Architect
          </p>
          <p className="text-xs text-slate-700 mt-1">trikalvaani.com</p>
        </div>
      </div>
    </div>
  );
}

// ── Sub Components ────────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(13,17,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="px-5 py-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        {icon && <span>{icon}</span>}
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function PlanetCard({ influence }: { influence: any }) {
  const strength = influence.strength ?? 50;
  const color = strength >= 65 ? '#22c55e' : strength >= 45 ? '#D4AF37' : '#ef4444';
  return (
    <div className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white text-sm">{influence.planet}</span>
          {influence.isRetrograde && <span className="text-xs text-orange-400">(R)</span>}
          <span className="text-xs text-slate-500">{influence.position}</span>
        </div>
        <div className="flex items-center gap-2">
          {influence.ashtakavargaScore && (
            <span className="text-xs text-slate-500">AV: {influence.ashtakavargaScore}</span>
          )}
          <div className="w-12 h-1.5 rounded-full bg-white/10">
            <div className="h-1.5 rounded-full" style={{ width: `${strength}%`, background: color }} />
          </div>
          <span className="text-xs" style={{ color }}>{strength}</span>
        </div>
      </div>
      <p className="text-xs text-slate-300">{influence.effect}</p>
      <p className="text-xs text-slate-600 mt-1">{influence.classicalBasis}</p>
    </div>
  );
}

function YogaCard({ yoga }: { yoga: any }) {
  const strengthColor = yoga.strength === 'strong' ? '#22c55e' : yoga.strength === 'moderate' ? '#D4AF37' : '#94a3b8';
  return (
    <div className="p-3 rounded-lg" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-sm" style={{ color: '#D4AF37' }}>✦ {yoga.name}</span>
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: `${strengthColor}20`, color: strengthColor }}>{yoga.strength}</span>
      </div>
      <p className="text-xs text-slate-300">{yoga.effect}</p>
      <p className="text-xs text-slate-600 mt-1">{yoga.classicalBasis}</p>
    </div>
  );
}

function RemedyCard({ remedy }: { remedy: any }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
      <p className="font-semibold text-amber-400 mb-3">Planet: {remedy.planet}</p>
      <div className="grid gap-2">
        {remedy.mantra?.text && (
          <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-xs text-slate-500 mb-0.5">Mantra</p>
            <p className="text-sm text-slate-300">{remedy.mantra.text}</p>
            <p className="text-xs text-slate-500">{remedy.mantra.count} times | {remedy.mantra.day} | {remedy.mantra.time} | facing {remedy.mantra.direction}</p>
          </div>
        )}
        {remedy.dana?.item && (
          <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-xs text-slate-500 mb-0.5">Dana (Charity)</p>
            <p className="text-sm text-slate-300">{remedy.dana.item} — {remedy.dana.day} {remedy.dana.time}</p>
          </div>
        )}
        {remedy.ratna?.gem && (
          <div className="p-2 rounded-lg" style={{ background: 'rgba(255,200,0,0.06)', border: '1px solid rgba(255,200,0,0.15)' }}>
            <p className="text-xs text-amber-500 mb-0.5">Ratna (Gemstone) ⚠️</p>
            <p className="text-sm text-slate-300">{remedy.ratna.gem} in {remedy.ratna.metal} | {remedy.ratna.finger} | min {remedy.ratna.weight}</p>
            <p className="text-xs text-orange-400 mt-1">Caution: {remedy.ratna.caution}</p>
          </div>
        )}
        {remedy.dos?.length > 0 && (
          <div className="mt-1">
            <p className="text-xs font-semibold text-green-400 mb-1">Do ✅</p>
            {remedy.dos.slice(0, 3).map((d: string, i: number) => (
              <p key={i} className="text-xs text-slate-400">• {d}</p>
            ))}
          </div>
        )}
        {remedy.donts?.length > 0 && (
          <div className="mt-1">
            <p className="text-xs font-semibold text-red-400 mb-1">Don't ❌</p>
            {remedy.donts.slice(0, 3).map((d: string, i: number) => (
              <p key={i} className="text-xs text-slate-400">• {d}</p>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-slate-600 mt-2">{remedy.classicalBasis}</p>
    </div>
  );
}

function DashaBlock({ dasha }: { dasha: any }) {
  return (
    <div className="space-y-2">
      {[
        { label: 'Mahadasha', data: dasha.mahadasha },
        { label: 'Antardasha', data: dasha.antardasha },
        { label: 'Pratyantar', data: dasha.pratyantar },
      ].filter(d => d.data?.lord).map(({ label, data }) => (
        <div key={label} className="flex items-start gap-3 p-3 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="min-w-24">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-sm font-semibold text-white">{data.lord}</p>
            <p className="text-xs text-slate-600">until {data.endDate}</p>
          </div>
          <p className="text-xs text-slate-300 flex-1">{data.domainEffect || data.immediateEffect}</p>
        </div>
      ))}
      {dasha.combinedDashaReading && (
        <p className="text-sm text-slate-300 mt-2 pt-2 border-t border-white/5">{dasha.combinedDashaReading}</p>
      )}
    </div>
  );
}

function PanchangBlock({ panchang }: { panchang: any }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Vara', value: `${panchang.vara} (${panchang.varaLord})` },
          { label: 'Tithi', value: panchang.tithi },
          { label: 'Nakshatra', value: panchang.nakshatra },
          { label: 'Yoga', value: panchang.yoga },
        ].map(item => (
          <div key={item.label} className="p-2 rounded-lg text-center"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="text-xs text-white font-medium">{item.value}</p>
          </div>
        ))}
      </div>
      {panchang.rahuKaal?.start && (
        <div className="p-2 rounded-lg"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-xs text-red-400">⚠️ Rahu Kaal: {panchang.rahuKaal.start} – {panchang.rahuKaal.end}</p>
          <p className="text-xs text-slate-500">Avoid starting important work during this time</p>
        </div>
      )}
      {panchang.abhijeetMuhurta?.start && (
        <div className="p-2 rounded-lg"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <p className="text-xs text-green-400">✦ Abhijeet Muhurta: {panchang.abhijeetMuhurta.start} – {panchang.abhijeetMuhurta.end}</p>
          <p className="text-xs text-slate-500">Best time for important actions today</p>
        </div>
      )}
      {panchang.panchangAdvice && (
        <p className="text-sm text-slate-300">{panchang.panchangAdvice}</p>
      )}
    </div>
  );
}

function UpgradeCTA({ price, message }: { price: string; message: string }) {
  return (
    <div className="rounded-xl p-6 text-center"
      style={{ background: 'rgba(212,175,55,0.06)', border: '1px dashed rgba(212,175,55,0.3)' }}>
      <div className="text-3xl mb-3">🔐</div>
      <p className="font-semibold text-white mb-2">{message}</p>
      <a href="/pricing"
        className="inline-block px-6 py-2.5 rounded-lg text-sm font-semibold mt-2"
        style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D76E)', color: '#080B12' }}>
        Upgrade for {price} →
      </a>
    </div>
  );
}
