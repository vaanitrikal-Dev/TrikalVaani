// lib/seo/calcJsonLd.ts — v1.0
// Gold-standard JSON-LD @graph builder for calculator pages.
// CEO: Rohiit Gupta | Chief Vedic Architect | Trikaal Vaani
// ------------------------------------------------------------
// Purpose: one shared builder so every /calculators/<slug> page
// injects an identical, @id-linked 8-node @graph (Org, WebSite,
// Person, WebPage, Breadcrumb, WebApplication, HowTo, FAQPage).
// Verified entities (read live from homepage JSON-LD) — do NOT fabricate.
// Changelog:
//   v1.0 (2026-06-02) — initial gold-standard helper.

const ORG_ID = 'https://trikalvaani.com/#organization';
const WEBSITE_ID = 'https://trikalvaani.com/#website';
const AUTHOR_ID = 'https://trikalvaani.com/#rohiit-gupta';
const AUTHOR_URL = 'https://trikalvaani.com/founder';
const REAL_SAMEAS = [
  'https://www.instagram.com/thetrikalvaani',
  'https://www.youtube.com/@TheTrikalVaani',
  'https://www.facebook.com/people/Trikal-Vaani-Voice',
];

export interface CalcSchemaInput {
  pageUrl: string;                       // canonical URL of the page
  name: string;                          // WebPage / WebApplication name
  description: string;                   // 1-line page description
  breadcrumbName: string;                // label in breadcrumb (e.g. "Free Baby Name by Nakshatra")
  aboutEntities: string[];               // entity-rich Things (planets/houses/nakshatras/doshas/etc.)
  knowsAbout?: string[];                 // author expertise (defaults provided)
  howToName: string;                     // e.g. "How to find your baby's lucky starting letter by nakshatra"
  howToSteps: { name: string; text: string }[];
  faqs: { q: string; a: string }[];
  dateModified?: string;                 // default '2026-06-02'
}

export function buildCalcJsonLd(i: CalcSchemaInput) {
  const dm = i.dateModified || '2026-06-02';
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: 'Trikaal Vaani',
        legalName: 'Trikal Vaani',
        url: 'https://trikalvaani.com',
        sameAs: REAL_SAMEAS,
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: 'Trikaal Vaani',
        url: 'https://trikalvaani.com',
        publisher: { '@id': ORG_ID },
        inLanguage: 'en-IN',
      },
      {
        '@type': 'Person',
        '@id': AUTHOR_ID,
        name: 'Rohiit Gupta',
        url: AUTHOR_URL,
        jobTitle: 'Chief Vedic Architect',
        worksFor: { '@id': ORG_ID },
        knowsAbout: i.knowsAbout || ['Vedic Astrology', 'Jyotish Shastra', 'Kundali Analysis', 'Remedies'],
      },
      {
        '@type': 'WebPage',
        '@id': `${i.pageUrl}#webpage`,
        url: i.pageUrl,
        name: i.name,
        description: i.description,
        inLanguage: 'en-IN',
        dateModified: dm,
        isPartOf: { '@id': WEBSITE_ID },
        author: { '@id': AUTHOR_ID },
        publisher: { '@id': ORG_ID },
        breadcrumb: { '@id': `${i.pageUrl}#breadcrumb` },
        about: i.aboutEntities.map((n) => ({ '@type': 'Thing', name: n })),
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.tv-aeo-answer'] },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${i.pageUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trikalvaani.com' },
          { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://trikalvaani.com/calculators' },
          { '@type': 'ListItem', position: 3, name: i.breadcrumbName, item: i.pageUrl },
        ],
      },
      {
        '@type': 'WebApplication',
        '@id': `${i.pageUrl}#app`,
        name: i.name,
        url: i.pageUrl,
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
        provider: { '@id': ORG_ID },
      },
      {
        '@type': 'HowTo',
        '@id': `${i.pageUrl}#howto`,
        name: i.howToName,
        totalTime: 'PT1M',
        step: i.howToSteps.map((s, idx) => ({
          '@type': 'HowToStep',
          position: idx + 1,
          name: s.name,
          text: s.text,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${i.pageUrl}#faq`,
        mainEntity: i.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
}
