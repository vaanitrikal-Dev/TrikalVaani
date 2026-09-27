// ============================================================
// TRIKAAL VAANI — components/wiki/WikiBlocks.tsx
// Version: 1.0 (27 Sep 2026)
// Owner: Rohiit Gupta, Chief Vedic Architect
//
// The Wikipedia-style blocks of the Trikaal Vaani standard format
// (editorial_rulings #8 section G), shared by /learn and /events:
//   Infobox · TableOfContents · Glossary · References · CiteText
// Same look as app/blog/[slug]/page.tsx v3.6 (dark: amber-300 headings,
// slate-900/40 cards). No hooks and no 'use client' — renders in server
// components (FestivalPillar) and inside client components (SeoPageLayout).
// All data rules (restricted granth, anchors, entities) come from lib/wiki.ts.
// ============================================================
import React from 'react';
import {
  GRANTH_META,
  canShowSanskrit,
  citationRef,
  citeAnchor,
  citeSplit,
  type WikiCitation,
  type WikiGlossaryTerm,
  type WikiInfoboxRow,
} from '@/lib/wiki';

/** Plain text with [^n] markers → superscript [n] links. Markers whose n has
 *  no reference are dropped (never a dangling [n]). `loc` makes anchor ids
 *  unique and matches firstCiteAnchors(). */
export function CiteText({ text, max, loc }: { text: string; max: number; loc: string }) {
  let occ = 0;
  return (
    <>
      {citeSplit(text).map((part, i) => {
        if (typeof part === 'string') return <React.Fragment key={i}>{part}</React.Fragment>;
        const thisOcc = occ;
        occ += 1;
        if (part < 1 || part > max) return null;
        return (
          <sup key={i} id={citeAnchor(part, loc, thisOcc)} className="ml-0.5 text-xs font-semibold leading-none">
            <a href={`#cite-${part}`} aria-label={`Source ${part}`} className="text-amber-400 no-underline hover:text-amber-200">
              [{part}]
            </a>
          </sup>
        );
      })}
    </>
  );
}

export function Infobox({ rows, max }: { rows: WikiInfoboxRow[]; max: number }) {
  if (!rows.length) return null;
  return (
    <aside
      aria-label="Key facts"
      className="mb-8 overflow-hidden rounded-xl border border-amber-800/50 bg-slate-900/70 text-sm md:float-right md:mb-6 md:ml-8 md:w-80"
    >
      <div className="bg-amber-950/70 px-4 py-2 text-center font-bold text-amber-300">मुख्य तथ्य · Key Facts</div>
      <table className="w-full">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-amber-900/30 align-top">
              <th scope="row" className="w-2/5 px-3 py-2 text-left font-semibold text-amber-200">{r.label}</th>
              <td className="px-3 py-2 leading-relaxed text-slate-200">
                <CiteText text={r.value} max={max} loc={`ib${i}`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </aside>
  );
}

export function TableOfContents({ items }: { items: { text: string; href: string }[] }) {
  if (items.length < 3) return null;
  return (
    <nav aria-label="Contents" className="mb-10 rounded-xl border border-amber-900/40 bg-slate-900/40 p-4 md:max-w-md">
      <details open>
        <summary className="cursor-pointer select-none font-bold text-amber-300">
          विषय सूची · Contents <span className="text-xs font-normal text-slate-400">({items.length})</span>
        </summary>
        <ol className="mt-3 ml-5 list-decimal space-y-1 text-sm text-slate-300">
          {items.map((h, k) => (
            <li key={k}>
              <a href={h.href} className="hover:text-amber-300 transition">{h.text}</a>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}

export function Glossary({ terms }: { terms: WikiGlossaryTerm[] }) {
  if (!terms.length) return null;
  return (
    <section id="glossary" aria-label="Glossary" className="my-12 scroll-mt-24 clear-both rounded-xl border border-amber-900/40 bg-slate-900/40 p-5 md:p-6">
      <h2 className="mb-4 text-2xl md:text-3xl font-bold text-amber-300">शब्दावली · Glossary</h2>
      <dl className="space-y-4">
        {terms.map((t, i) => (
          <div key={i}>
            <dt className="font-semibold text-amber-200">
              {t.same_as ? (
                <a href={t.same_as} target="_blank" rel="noopener noreferrer" className="hover:underline">{t.term}</a>
              ) : (
                t.term
              )}
            </dt>
            <dd className="mt-1 leading-relaxed text-slate-300">{t.definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function References({
  citations,
  hi,
  backRefs,
}: {
  citations: WikiCitation[];
  hi: boolean;
  backRefs: Map<number, string>;
}) {
  if (!citations.length) return null;
  return (
    <section
      id="granth-sandarbh"
      aria-label="Granth Sandarbh — Classical Sources"
      className="my-12 scroll-mt-24 clear-both rounded-xl border border-amber-900/40 bg-slate-900/40 p-5 md:p-6"
    >
      <h2 className="mb-4 text-2xl md:text-3xl font-bold text-amber-300">ग्रंथ सन्दर्भ · Classical Sources</h2>
      <ol className="divide-y divide-amber-900/30">
        {citations.map((c, i) => {
          const n = i + 1;
          const meta = c.work ? GRANTH_META[c.work] : undefined;
          const main = hi ? c.rule_hi || c.rule_en : c.rule_en || c.rule_hi;
          const second = hi ? (c.rule_hi ? c.rule_en : null) : c.rule_en ? c.rule_hi : null;
          const ref = citationRef(c, hi);
          const back = backRefs.get(n);
          return (
            <li key={i} id={`cite-${n}`} className="scroll-mt-24 py-4 first:pt-0 last:pb-0">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-amber-400">[{n}]</span>
                {back && (
                  <a href={`#${back}`} aria-label={hi ? 'लेख में वापस' : 'Back to text'} className="text-amber-500 no-underline hover:text-amber-200">↑</a>
                )}
                <span className="font-semibold text-amber-200">
                  {c.granth}
                  {meta && (
                    <span className="ml-2 text-sm font-normal text-slate-400">
                      {meta.sa}
                      {meta.author ? ` · ${meta.author}` : ''}
                    </span>
                  )}
                </span>
              </div>
              {canShowSanskrit(c) && (
                <blockquote lang="sa" className="mt-3 whitespace-pre-line border-l-2 border-amber-600 pl-4 text-base italic leading-relaxed text-amber-100">
                  {c.sanskrit}
                </blockquote>
              )}
              {ref && <div className="mt-1.5 text-sm italic text-amber-400">— {c.granth}, {ref}</div>}
              {main && <p className="mt-2 leading-relaxed text-slate-200">{main}</p>}
              {second && <p className="mt-1 text-sm leading-relaxed text-slate-400">{second}</p>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
