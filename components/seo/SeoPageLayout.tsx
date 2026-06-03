'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import type { SeoPage } from '@/lib/seo-content'
import SeoSidebar from './SeoSidebar'

interface Props {
  page: SeoPage
  clusterPages: Pick<SeoPage, 'slug' | 'title_en' | 'page_type'>[]
  relatedPages: Pick<SeoPage, 'slug' | 'title_en' | 'meta_description'>[]
}

/* ── Markdown-to-JSX renderer (lightweight, no dependency) ── */
function renderMarkdown(md: string): React.ReactNode[] {
  if (!md) return []
  const lines = md.split('\n')
  const nodes: React.ReactNode[] = []
  let i = 0
  let listBuffer: string[] = []
  let listType: 'ul' | 'ol' | null = null
  let tableLines: string[] = []

  function flushList() {
    if (!listBuffer.length) return
    const Tag = listType === 'ol' ? 'ol' : 'ul'
    nodes.push(
      <Tag key={`list-${i}`} className="seo-list">
        {listBuffer.map((item, j) => (
          <li key={j} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
        ))}
      </Tag>
    )
    listBuffer = []
    listType = null
  }

  function flushTable() {
    if (!tableLines.length) return
    const rows = tableLines.map(l =>
      l.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim())
    )
    const [header, , ...body] = rows
    nodes.push(
      <div key={`table-${i}`} className="seo-table-wrap">
        <table className="seo-table">
          <thead><tr>{header?.map((h, j) => <th key={j} dangerouslySetInnerHTML={{ __html: inlineFormat(h) }} />)}</tr></thead>
          <tbody>{body.map((row, ri) => (
            <tr key={ri}>{row.map((cell, ci) => <td key={ci} dangerouslySetInnerHTML={{ __html: inlineFormat(cell) }} />)}</tr>
          ))}</tbody>
        </table>
      </div>
    )
    tableLines = []
  }

  function inlineFormat(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="seo-inline-link">$1</a>')
  }

  while (i < lines.length) {
    const line = lines[i]

    // Blank line — flush list/table
    if (!line.trim()) {
      flushList()
      flushTable()
      i++
      continue
    }

    // Table row
    if (line.trim().startsWith('|')) {
      tableLines.push(line)
      i++
      continue
    } else {
      flushTable()
    }

    // HR
    if (/^---+$/.test(line.trim())) {
      flushList()
      nodes.push(<hr key={`hr-${i}`} className="seo-hr" />)
      i++
      continue
    }

    // Headings
    if (line.startsWith('### ')) {
      flushList()
      nodes.push(<h3 key={`h3-${i}`} className="seo-h3" dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(4)) }} />)
      i++; continue
    }
    if (line.startsWith('## ')) {
      flushList()
      nodes.push(<h2 key={`h2-${i}`} className="seo-h2" dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(3)) }} />)
      i++; continue
    }
    if (line.startsWith('# ')) {
      flushList()
      nodes.push(<h1 key={`h1-${i}`} className="seo-h1" dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(2)) }} />)
      i++; continue
    }

    // Blockquote (GEO block)
    if (line.startsWith('> ')) {
      flushList()
      nodes.push(
        <blockquote key={`bq-${i}`} className="seo-geo-block">
          <span dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(2)) }} />
        </blockquote>
      )
      i++; continue
    }

    // Unordered list
    if (/^[-*] /.test(line)) {
      if (listType !== 'ul') { flushList(); listType = 'ul' }
      listBuffer.push(line.replace(/^[-*] /, ''))
      i++; continue
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      if (listType !== 'ol') { flushList(); listType = 'ol' }
      listBuffer.push(line.replace(/^\d+\. /, ''))
      i++; continue
    }

    // Paragraph
    flushList()
    nodes.push(<p key={`p-${i}`} className="seo-p" dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />)
    i++
  }

  flushList()
  flushTable()
  return nodes
}

/* ── Category label colours ── */
const CATEGORY_COLOURS: Record<string, string> = {
  prediction: '#C8902D',
  knowledge:  '#2D7A9A',
  festival:   '#8B2D8B',
  transit:    '#2D6B2D',
  trending:   '#A0340F',
}

const CATEGORY_LABELS: Record<string, string> = {
  prediction: '🔮 Prediction',
  knowledge:  '📚 Knowledge',
  festival:   '🪔 Festival',
  transit:    '🪐 Transit',
  trending:   '🔥 Trending',
}

export default function SeoPageLayout({ page, clusterPages, relatedPages }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const catColour = CATEGORY_COLOURS[page.category] || '#C8902D'
  const readTime = page.reading_time_min || Math.ceil((page.word_count || 1000) / 200)

  return (
    <>
      {/* ── Inline styles ── */}
      <style>{`
        :root {
          --tv-gold:   #C8902D;
          --tv-deep:   #0D0A06;
          --tv-cream:  #F5EDD8;
          --tv-muted:  #8C7B60;
          --tv-border: rgba(200,144,45,0.18);
          --tv-glow:   rgba(200,144,45,0.08);
        }
        .seo-root {
          min-height: 100vh;
          background: var(--tv-deep);
          color: var(--tv-cream);
          font-family: 'Georgia', 'Times New Roman', serif;
        }
        /* ── Hero ── */
        .seo-hero {
          position: relative;
          padding: 3.5rem 1.5rem 2.5rem;
          background: radial-gradient(ellipse 120% 80% at 50% -10%, rgba(200,144,45,0.14) 0%, transparent 70%),
                      linear-gradient(180deg, #120E08 0%, var(--tv-deep) 100%);
          border-bottom: 1px solid var(--tv-border);
          overflow: hidden;
        }
        .seo-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8902D' fill-opacity='0.03'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }
        .seo-hero-inner {
          max-width: 820px;
          margin: 0 auto;
          position: relative;
        }
        .seo-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.78rem;
          color: var(--tv-muted);
          margin-bottom: 1.25rem;
          font-family: 'Georgia', serif;
          letter-spacing: 0.02em;
        }
        .seo-breadcrumb a { color: var(--tv-muted); text-decoration: none; }
        .seo-breadcrumb a:hover { color: var(--tv-gold); }
        .seo-breadcrumb span { color: var(--tv-border); }
        .seo-category-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.8rem;
          border-radius: 2px;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: 'Georgia', serif;
          margin-bottom: 1rem;
          border: 1px solid;
        }
        .seo-title {
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          font-weight: 700;
          line-height: 1.25;
          color: var(--tv-cream);
          margin: 0 0 1rem;
          font-family: 'Georgia', 'Times New Roman', serif;
          letter-spacing: -0.01em;
        }
        .seo-title em {
          font-style: normal;
          color: var(--tv-gold);
        }
        .seo-meta-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
          font-size: 0.8rem;
          color: var(--tv-muted);
          margin-bottom: 1.5rem;
        }
        .seo-meta-row span {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        /* ── GEO Block ── */
        .seo-geo-answer {
          background: linear-gradient(135deg, rgba(200,144,45,0.1), rgba(200,144,45,0.05));
          border: 1px solid rgba(200,144,45,0.3);
          border-left: 3px solid var(--tv-gold);
          border-radius: 4px;
          padding: 1rem 1.2rem;
          margin-bottom: 1.5rem;
          font-size: 0.92rem;
          line-height: 1.7;
          color: #E8D5A8;
        }
        .seo-geo-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--tv-gold);
          margin-bottom: 0.4rem;
          font-family: 'Georgia', serif;
        }
        /* ── CTA Hero Button ── */
        .seo-cta-hero {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #C8902D, #A0700F);
          color: #fff;
          font-weight: 700;
          padding: 0.7rem 1.5rem;
          border-radius: 3px;
          text-decoration: none;
          font-size: 0.9rem;
          letter-spacing: 0.02em;
          font-family: 'Georgia', serif;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(200,144,45,0.3);
          border: none;
          cursor: pointer;
        }
        .seo-cta-hero:hover {
          background: linear-gradient(135deg, #D9A040, #B07A1F);
          box-shadow: 0 6px 28px rgba(200,144,45,0.45);
          transform: translateY(-1px);
        }
        /* ── Layout ── */
        .seo-layout {
          display: grid;
          grid-template-columns: 1fr;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          gap: 2rem;
        }
        @media (min-width: 960px) {
          .seo-layout {
            grid-template-columns: 240px 1fr;
            padding: 0 2rem;
          }
        }
        /* ── Article body ── */
        .seo-article {
          padding: 2rem 0;
          min-width: 0;
        }
        .seo-h1 {
          font-size: 1.8rem; color: var(--tv-cream); margin: 2rem 0 0.75rem;
          font-family: 'Georgia', serif; font-weight: 700;
        }
        .seo-h2 {
          font-size: 1.35rem; color: var(--tv-gold); margin: 2.5rem 0 0.75rem;
          font-family: 'Georgia', serif; font-weight: 700; letter-spacing: 0.01em;
          padding-bottom: 0.4rem; border-bottom: 1px solid var(--tv-border);
        }
        .seo-h3 {
          font-size: 1.1rem; color: #D4B87A; margin: 1.75rem 0 0.6rem;
          font-family: 'Georgia', serif; font-weight: 700;
        }
        .seo-p {
          line-height: 1.85; color: #C9B48A; margin: 0 0 1.1rem;
          font-size: 0.96rem;
        }
        .seo-list {
          padding-left: 1.4rem; margin: 0 0 1.25rem;
          color: #C9B48A; line-height: 1.8; font-size: 0.96rem;
        }
        .seo-list li { margin-bottom: 0.4rem; }
        .seo-hr {
          border: none; border-top: 1px solid var(--tv-border);
          margin: 2rem 0;
        }
        .seo-geo-block {
          background: rgba(200,144,45,0.07);
          border-left: 3px solid var(--tv-gold);
          padding: 0.8rem 1rem;
          margin: 1.25rem 0;
          font-style: italic;
          color: #D4C090;
          font-size: 0.95rem;
          line-height: 1.75;
        }
        .seo-inline-link {
          color: var(--tv-gold);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        code {
          background: rgba(200,144,45,0.12);
          color: #E8C87A;
          padding: 0.15em 0.4em;
          border-radius: 3px;
          font-size: 0.88em;
          font-family: 'Courier New', monospace;
        }
        /* ── Table ── */
        .seo-table-wrap { overflow-x: auto; margin: 1.25rem 0; }
        .seo-table {
          width: 100%; border-collapse: collapse;
          font-size: 0.88rem; color: #C9B48A;
        }
        .seo-table th {
          background: rgba(200,144,45,0.12);
          color: var(--tv-gold); font-weight: 700;
          padding: 0.6rem 0.9rem; text-align: left;
          border-bottom: 1px solid var(--tv-border);
          font-family: 'Georgia', serif;
        }
        .seo-table td {
          padding: 0.55rem 0.9rem;
          border-bottom: 1px solid rgba(200,144,45,0.08);
        }
        .seo-table tr:hover td { background: rgba(200,144,45,0.04); }
        /* ── FAQ ── */
        .seo-faq { margin: 2.5rem 0; }
        .seo-faq-title {
          font-size: 1.2rem; color: var(--tv-gold);
          font-family: 'Georgia', serif; font-weight: 700;
          margin-bottom: 1rem; padding-bottom: 0.4rem;
          border-bottom: 1px solid var(--tv-border);
        }
        .seo-faq-item {
          border: 1px solid var(--tv-border);
          border-radius: 4px;
          margin-bottom: 0.6rem;
          overflow: hidden;
        }
        .seo-faq-q {
          width: 100%; text-align: left;
          background: rgba(200,144,45,0.06);
          color: var(--tv-cream); padding: 0.85rem 1rem;
          font-size: 0.92rem; font-family: 'Georgia', serif;
          font-weight: 600; cursor: pointer; border: none;
          display: flex; justify-content: space-between; align-items: center;
          gap: 0.5rem; line-height: 1.4;
          transition: background 0.15s;
        }
        .seo-faq-q:hover { background: rgba(200,144,45,0.1); }
        .seo-faq-q .arrow {
          flex-shrink: 0; transition: transform 0.2s;
          font-size: 0.75rem; color: var(--tv-gold);
        }
        .seo-faq-q.open .arrow { transform: rotate(180deg); }
        .seo-faq-a {
          padding: 0.85rem 1rem; font-size: 0.88rem;
          color: #C9B48A; line-height: 1.75;
          border-top: 1px solid var(--tv-border);
          background: rgba(200,144,45,0.03);
        }
        /* ── CTA Box ── */
        .seo-cta-box {
          background: linear-gradient(135deg, rgba(200,144,45,0.12), rgba(200,144,45,0.05));
          border: 1px solid rgba(200,144,45,0.3);
          border-radius: 6px; padding: 1.75rem;
          margin: 2.5rem 0; text-align: center;
        }
        .seo-cta-box h3 {
          font-size: 1.15rem; color: var(--tv-cream);
          margin: 0 0 0.5rem; font-family: 'Georgia', serif;
        }
        .seo-cta-box p {
          font-size: 0.88rem; color: var(--tv-muted);
          margin: 0 0 1.1rem; line-height: 1.6;
        }
        /* ── Related ── */
        .seo-related { margin-top: 2.5rem; }
        .seo-related-title {
          font-size: 1.1rem; color: var(--tv-gold);
          font-family: 'Georgia', serif; font-weight: 700;
          margin-bottom: 1rem; padding-bottom: 0.4rem;
          border-bottom: 1px solid var(--tv-border);
        }
        .seo-related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 0.8rem;
        }
        .seo-related-card {
          background: rgba(200,144,45,0.05);
          border: 1px solid var(--tv-border);
          border-radius: 4px; padding: 1rem;
          text-decoration: none; display: block;
          transition: all 0.15s;
        }
        .seo-related-card:hover {
          background: rgba(200,144,45,0.1);
          border-color: rgba(200,144,45,0.4);
          transform: translateY(-2px);
        }
        .seo-related-card h4 {
          font-size: 0.88rem; color: var(--tv-cream);
          font-family: 'Georgia', serif; margin: 0 0 0.4rem;
          line-height: 1.4; font-weight: 600;
        }
        .seo-related-card p {
          font-size: 0.78rem; color: var(--tv-muted);
          margin: 0; line-height: 1.5;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        /* ── Classical ref footer ── */
        .seo-classical-ref {
          margin-top: 2rem; padding: 1rem;
          border: 1px solid var(--tv-border);
          border-radius: 4px;
          background: rgba(200,144,45,0.03);
        }
        .seo-classical-ref-label {
          font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--tv-gold); margin-bottom: 0.35rem;
          font-family: 'Georgia', serif;
        }
        .seo-classical-ref p {
          font-size: 0.82rem; color: var(--tv-muted);
          margin: 0; font-style: italic; line-height: 1.6;
        }
        /* ── Mobile sidebar toggle ── */
        .seo-sidebar-toggle {
          display: flex; align-items: center; gap: 0.5rem;
          background: rgba(200,144,45,0.1); border: 1px solid var(--tv-border);
          color: var(--tv-cream); padding: 0.5rem 1rem;
          border-radius: 3px; cursor: pointer; font-size: 0.85rem;
          margin: 1rem 0; width: 100%; justify-content: center;
          font-family: 'Georgia', serif;
        }
        @media (min-width: 960px) {
          .seo-sidebar-toggle { display: none; }
        }
        /* ── Maa Shakti ── */
        .seo-maa-shakti {
          text-align: center; padding: 1.25rem;
          border-top: 1px solid var(--tv-border);
          font-size: 0.8rem; color: var(--tv-muted);
          font-style: italic; margin-top: 2rem;
          letter-spacing: 0.03em;
        }
      `}</style>

      <div className="seo-root">
        {/* ── Hero ── */}
        <div className="seo-hero">
          <div className="seo-hero-inner">
            {/* Breadcrumb */}
            <nav className="seo-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span>›</span>
              <Link href="/learn">Learn</Link>
              <span>›</span>
              <Link href={`/learn?cluster=${page.cluster}`}>{page.cluster}</Link>
              <span>›</span>
              <span style={{ color: '#A08050' }}>{page.title_en.slice(0, 48)}…</span>
            </nav>

            {/* Category badge */}
            <div
              className="seo-category-badge"
              style={{
                color: catColour,
                borderColor: `${catColour}40`,
                background: `${catColour}12`,
              }}
            >
              {CATEGORY_LABELS[page.category] || page.category}
            </div>

            {/* Title */}
            <h1 className="seo-title">{page.title_en}</h1>

            {/* Meta row */}
            <div className="seo-meta-row">
              <span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {page.eeat_author}
              </span>
              <span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                {readTime} min read
              </span>
              <span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                {page.word_count?.toLocaleString()} words
              </span>
              <span style={{ textTransform: 'capitalize' }}>
                🔍 {page.search_intent}
              </span>
            </div>

            {/* GEO direct answer */}
            <div className="seo-geo-answer">
              <div className="seo-geo-label">Direct Answer — AI-Optimised</div>
              {page.geo_answer}
            </div>

            {/* Primary CTA */}
            <Link href={page.cta_href} className="seo-cta-hero">
              ✦ {page.cta_text}
            </Link>
          </div>
        </div>

        {/* ── Body Layout ── */}
        <div className="seo-layout">
          {/* Sidebar */}
          <aside>
            <button
              className="seo-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? '▲ Hide' : '▼ Show'} {page.cluster} Guide
            </button>
            <div style={{ display: sidebarOpen ? 'block' : 'none' }} className="block-md">
              <SeoSidebar pages={clusterPages} currentSlug={page.slug} cluster={page.cluster} />
            </div>
            <div className="hidden-mobile">
              <SeoSidebar pages={clusterPages} currentSlug={page.slug} cluster={page.cluster} />
            </div>
          </aside>

          {/* Article */}
          <article className="seo-article">
            {/* Body content */}
            {page.body_content ? (
              <div>{renderMarkdown(page.body_content)}</div>
            ) : (
              <p className="seo-p">{page.meta_description}</p>
            )}

            {/* FAQ Section */}
            {page.faq_block?.length > 0 && (
              <div className="seo-faq">
                <div className="seo-faq-title">Frequently Asked Questions</div>
                {page.faq_block.map((faq, i) => (
                  <FaqItem key={i} q={faq.q} a={faq.a} />
                ))}
              </div>
            )}

            {/* CTA Box */}
            <div className="seo-cta-box">
              <h3>Get Your Personalised {page.cluster} Reading</h3>
              <p>
                Rohiit Gupta, Chief Vedic Architect at Trikaal Vaani, will analyse your birth
                chart using classical Jyotish Shastra — giving you specific timing, predictions,
                and remedies personalised to your chart.
              </p>
              <Link href={page.cta_href} className="seo-cta-hero">
                ✦ {page.cta_text}
              </Link>
            </div>

            {/* Classical reference */}
            {page.classical_ref && (
              <div className="seo-classical-ref">
                <div className="seo-classical-ref-label">Classical Sources</div>
                <p>{page.classical_ref}</p>
              </div>
            )}

            {/* Related pages */}
            {relatedPages.length > 0 && (
              <div className="seo-related">
                <div className="seo-related-title">Explore Related Topics</div>
                <div className="seo-related-grid">
                  {relatedPages.map(rp => (
                    <Link key={rp.slug} href={`/learn/${rp.slug}`} className="seo-related-card">
                      <h4>{rp.title_en}</h4>
                      <p>{rp.meta_description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Maa Shakti */}
            <div className="seo-maa-shakti">
              ॐ ✦ With the blessings of Maa Shakti — Trikaal Vaani ✦ ॐ
            </div>
          </article>
        </div>
      </div>

      <style>{`
        .block-md { }
        .hidden-mobile { display: none; }
        @media (min-width: 960px) {
          .block-md { display: none !important; }
          .hidden-mobile { display: block; }
        }
      `}</style>
    </>
  )
}

/* ── FAQ Accordion Item ── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="seo-faq-item">
      <button
        className={`seo-faq-q${open ? ' open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <span className="arrow">▼</span>
      </button>
      {open && <div className="seo-faq-a">{a}</div>}
    </div>
  )
}


