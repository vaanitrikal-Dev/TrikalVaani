/**
 * ============================================================================
 * 🔱 TRIKAAL VAANI — CEO PROTECTION HEADER 🔱
 * ============================================================================
 * File:    app/editorial-policy/page.tsx   (NEW FILE)
 * Version: 1.0 (11 Nov 2026) — "How Trikaal Vaani Content Is Made".
 *          Text approved by Rohiit Gupta on 11 Nov 2026 (review wording = option A:
 *          blog articles are approved one by one before they reach search; every
 *          other page change is reported to him daily).
 * Owner:   Rohiit Gupta, Chief Vedic Architect
 * RULE:    every sentence on this page must stay TRUE. If the process changes,
 *          change this page in the same deploy.
 * ============================================================================
 */

import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";

const SITE = "https://trikalvaani.com";
const URL = `${SITE}/editorial-policy`;
const GOLD = "#D4AF37";
const UDYAM_NUMBER = "UDYAM-DL-10-0119070";
const ADDRESS = "724, Pocket 3, Sector 19, Dwarka, New Delhi 110075";

const TITLE = "How Trikaal Vaani Content Is Made | Editorial Policy";
const DESCRIPTION =
  "Who writes and checks Trikaal Vaani pages: Swiss Ephemeris calculations, shlok from our own Granth library, AI drafts, and review by Rohiit Gupta.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  authors: [{ name: "Rohiit Gupta", url: `${SITE}/founder` }],
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, siteName: "Trikaal Vaani", locale: "en_IN", type: "article" },
  robots: { index: true, follow: true },
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${URL}#page`,
      url: URL,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "en-IN",
      dateModified: "2026-11-11",
      author: { "@id": `${SITE}/founder#rohiit-gupta` },
      publisher: { "@id": `${SITE}/#organization` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        { "@type": "ListItem", position: 2, name: "Editorial Policy", item: URL },
      ],
    },
  ],
};

const SECTIONS: { h: string; p: React.ReactNode[] }[] = [
  {
    h: "Who is responsible",
    p: [
      <>Every page on this site is published under one name: <Link href="/founder" style={{ color: GOLD }} className="hover:underline">Rohiit Gupta</Link>, Chief Vedic Architect, who has practised Vedic astrology in the Parashara BPHS tradition for more than 16 years.</>,
      <>Trikaal Vaani is registered with the Government of India as an MSME ({UDYAM_NUMBER}) and works from {ADDRESS}.</>,
    ],
  },
  {
    h: "How the calculations are done",
    p: [
      <>Kundali, dasha, panchang, muhurat and festival dates are calculated with the Swiss Ephemeris and Lahiri ayanamsha. These are computed values, not text written by an AI model, and where a time depends on the city the page says so.</>,
    ],
  },
  {
    h: "Where the classical references come from",
    p: [
      <>Shlok quoted on our pages come from our own Granth library, a database of classical texts such as Brihat Parashara Hora Shastra, Phaladipika and Muhurta Chintamani, stored verse by verse in Sanskrit.</>,
      <>Our rule is simple: no verse, no citation. A reference is shown only when a verse whose own words support the statement has been found and read. Many pages therefore carry no citation at all.</>,
    ],
  },
  {
    h: "Where AI is used",
    p: [
      <>First drafts of articles are written with AI, following written editorial rules that Rohiit has set: a direct answer first, the granth reference where one exists, remedies that are simple and low-cost, and no fear-based language.</>,
      <>Personal readings are also composed by AI from the seeker&apos;s calculated birth chart, using Rohiit&apos;s reading framework.</>,
    ],
  },
  {
    h: "How pages are reviewed",
    p: [
      <>Blog articles are offered to search engines only after Rohiit has read and approved them, one by one. An article that is still waiting for his review stays open to visitors but is marked so that search engines do not index it.</>,
      <>For every other page, each change is reported to Rohiit daily, and he can stop or correct any page. A page he has reviewed shows a &ldquo;Last reviewed&rdquo; date.</>,
    ],
  },
  {
    h: "What we do not do",
    p: [
      <>We do not publish frightening predictions, guaranteed results, or claims that astrology can cure an illness. Astrology on this site is guidance. For health, legal and financial decisions, please consult a qualified professional.</>,
    ],
  },
  {
    h: "Found a mistake?",
    p: [
      <>Tell us on WhatsApp at <a href="https://wa.me/919211804111?text=Hi%20Rohiit%20ji%2C%20I%20found%20a%20mistake%20on%20a%20Trikaal%20Vaani%20page" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }} className="hover:underline">+91 92118 04111</a> or by email at <a href="mailto:rohiit@trikalvaani.com" style={{ color: GOLD }} className="hover:underline">rohiit@trikalvaani.com</a>, with the page link. Corrections are made on the page itself.</>,
    ],
  },
];

export default function EditorialPolicyPage() {
  return (
    <main className="min-h-screen bg-[#080B12] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <SiteNav />
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: GOLD }}>Editorial Policy</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-5">How Trikaal Vaani Content Is Made</h1>
            <p className="text-gray-300 text-base leading-relaxed">
              Trikaal Vaani pages are built in three layers: calculations from the Swiss Ephemeris, references from our own
              library of classical granth, and drafts written with AI under editorial rules set by Rohiit Gupta. Blog articles
              reach search engines only after he has approved them.
            </p>
            <p className="text-gray-600 text-xs mt-4">Last updated: 11 November 2026 · By Rohiit Gupta, Chief Vedic Architect</p>
          </div>

          <div className="space-y-10 text-gray-400 text-sm leading-relaxed">
            {SECTIONS.map((s) => (
              <div key={s.h}>
                <h2 className="font-serif text-2xl font-bold text-white mb-4">{s.h}</h2>
                {s.p.map((para, i) => (
                  <p key={i} className="mb-3">{para}</p>
                ))}
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-wrap gap-6">
            <Link href="/founder" className="text-sm hover:underline" style={{ color: GOLD }}>About Rohiit Gupta</Link>
            <Link href="/contact" className="text-sm hover:underline" style={{ color: GOLD }}>Contact</Link>
            <Link href="/calculators" className="text-gray-500 text-sm hover:text-gray-300">Free Calculators</Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

// END — app/editorial-policy/page.tsx v1.0 | Trikaal Vaani | Rohiit Gupta
