// ============================================================
// File: components/seo/PillarBody.tsx
// Version: v1.0  (NEW FILE)
// Purpose: Server-rendered markdown body for Supabase-stored pillar content
//          on money pages that own their own route (e.g. /hast-rekha-calculator).
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// Date: 2026-07-12
// ============================================================
// WHY THIS EXISTS:
//   SeoPageLayout.tsx has a markdown renderer, but it is a CLIENT component
//   bound to the /learn layout (sidebar, cluster nav, related pages). Money
//   pages need the body only — rendered on the SERVER so the text is in the
//   initial HTML and is fully crawlable / quotable by AI engines.
//
// SUPPORTED MARKDOWN (same subset the pillar rows use):
//   ## H2 · ### H3 · **bold** · *italic* · [link](/path) · - bullets
//   1. numbered · --- horizontal rule · plain paragraphs
// ============================================================

import React from 'react';

const GOLD = '#D4AF37';

function inlineFormat(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#E8D08B">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" style="color:#D4AF37;text-decoration:underline;text-underline-offset:3px">$1</a>'
    );
}

export default function PillarBody({ markdown }: { markdown: string }) {
  const lines = markdown.split('\n');
  const nodes: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let ordered = false;

  const flushList = () => {
    if (!listBuffer.length) return;
    const items = listBuffer.map((item, j) => (
      <li key={j} className="mb-2" dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
    ));
    nodes.push(
      ordered ? (
        <ol key={`ol-${nodes.length}`} className="list-decimal pl-6 mb-6 text-slate-300 leading-relaxed">
          {items}
        </ol>
      ) : (
        <ul key={`ul-${nodes.length}`} className="list-disc pl-6 mb-6 text-slate-300 leading-relaxed">
          {items}
        </ul>
      )
    );
    listBuffer = [];
    ordered = false;
  };

  lines.forEach((raw, i) => {
    const line = raw.trim();

    if (!line) {
      flushList();
      return;
    }

    if (line.startsWith('### ')) {
      flushList();
      nodes.push(
        <h3
          key={`h3-${i}`}
          className="text-xl md:text-2xl font-serif font-bold mt-10 mb-4"
          style={{ color: GOLD }}
          dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(4)) }}
        />
      );
      return;
    }

    if (line.startsWith('## ')) {
      flushList();
      nodes.push(
        <h2
          key={`h2-${i}`}
          className="text-2xl md:text-3xl font-serif font-bold mt-12 mb-5"
          style={{ color: GOLD }}
          dangerouslySetInnerHTML={{ __html: inlineFormat(line.slice(3)) }}
        />
      );
      return;
    }

    if (line === '---') {
      flushList();
      nodes.push(
        <hr key={`hr-${i}`} className="my-10" style={{ borderColor: 'rgba(212,175,55,0.18)' }} />
      );
      return;
    }

    if (/^[-*] /.test(line)) {
      if (ordered) flushList();
      listBuffer.push(line.replace(/^[-*] /, ''));
      return;
    }

    if (/^\d+\. /.test(line)) {
      if (!ordered && listBuffer.length) flushList();
      ordered = true;
      listBuffer.push(line.replace(/^\d+\. /, ''));
      return;
    }

    flushList();
    nodes.push(
      <p
        key={`p-${i}`}
        className="mb-5 text-slate-300 leading-relaxed text-base md:text-[17px]"
        dangerouslySetInnerHTML={{ __html: inlineFormat(line) }}
      />
    );
  });

  flushList();

  return <article className="max-w-3xl mx-auto">{nodes}</article>;
}
