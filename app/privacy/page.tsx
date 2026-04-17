import Link from 'next/link';
import type { Metadata } from 'next';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';

export const metadata: Metadata = {
  title: 'Privacy Policy | Trikal Vaani',
  description: 'Privacy Policy for Trikal Vaani. Learn how we collect, use, and protect your personal data.',
  alternates: { canonical: 'https://trikalvaani.com/privacy' },
};

const GOLD = '#D4AF37';
const GOLD_RGBA = (a: number) => `rgba(212,175,55,${a})`;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2
        className="font-serif text-xl font-bold mb-4"
        style={{ color: GOLD }}
      >
        {title}
      </h2>
      <div className="text-sm text-slate-400 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#030712]">
      <SiteNav />
      <main className="max-w-3xl mx-auto px-4 py-20">
        <div className="mb-12">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: GOLD_RGBA(0.55) }}
          >
            Legal
          </p>
          <h1 className="font-serif text-4xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500">
            Effective Date: 1 January 2025 &nbsp;·&nbsp; Last Updated: 1 April 2025
          </p>
          <div
            className="mt-6 h-px w-16"
            style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }}
          />
        </div>

        <Section title="1. Who We Are">
          <p>
            Trikal Vaani Global (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the AI Vedic Astrology Research Platform at trikalvaani.com. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit or use our Platform. Founder and Data Controller: Rohiit Gupta, Delhi NCR, India.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect the following categories of data:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong className="text-white">Birth Data:</strong> Name, date of birth, approximate birth time, and birth city — collected only when you initiate a free analysis. This data is used solely to generate your Vedic profile.
            </li>
            <li>
              <strong className="text-white">Waitlist / Contact Data:</strong> Email address, if you voluntarily join the Inner Circle Waitlist or contact us.
            </li>
            <li>
              <strong className="text-white">Usage Data:</strong> Page views, session duration, browser type, and IP address — collected automatically via analytics to improve the Platform.
            </li>
            <li>
              <strong className="text-white">Payment Data:</strong> For paid reports, payment is processed by a third-party gateway (Razorpay / Stripe). We do not store full card or bank details.
            </li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>Your data is used to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Generate and display your personalised Vedic AI analysis.</li>
            <li>Improve the accuracy and performance of our AI models (in aggregate, anonymised form only).</li>
            <li>Send you updates or reports if you explicitly opted in.</li>
            <li>Process payments and manage premium report delivery.</li>
            <li>Comply with legal obligations.</li>
          </ul>
          <p>
            We <strong className="text-white">never sell</strong> your personal data to third parties for marketing purposes.
          </p>
        </Section>

        <Section title="4. Data Retention">
          <p>
            Birth data submitted for free analysis is retained in our database for a maximum of 12 months, after which it is deleted or anonymised. Waitlist email addresses are retained until you unsubscribe. Payment records are retained for 7 years as required by Indian tax law.
          </p>
        </Section>

        <Section title="5. Data Sharing">
          <p>We may share data with:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong className="text-white">Supabase:</strong> Our database and backend infrastructure provider, based in the EU/US. Data is encrypted at rest and in transit.</li>
            <li><strong className="text-white">Payment Processors:</strong> Razorpay / Stripe for payment processing.</li>
            <li><strong className="text-white">Analytics:</strong> Aggregated, anonymised usage data may be processed by analytics tools.</li>
            <li><strong className="text-white">Legal Authorities:</strong> Where required by court order or applicable law.</li>
          </ul>
        </Section>

        <Section title="6. Cookies">
          <p>
            We use essential cookies necessary for Platform functionality and analytics cookies to understand usage patterns. You may disable cookies in your browser settings; however, some features may not function correctly. We do not use advertising cookies or third-party tracking pixels.
          </p>
        </Section>

        <Section title="7. Your Rights">
          <p>
            Under applicable data protection laws (including India&apos;s Digital Personal Data Protection Act 2023), you have the right to:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data (subject to legal retention obligations).</li>
            <li>Withdraw consent at any time for non-essential processing.</li>
          </ul>
          <p>
            To exercise these rights, email{' '}
            <a href="mailto:privacy@trikalvaani.com" className="underline" style={{ color: GOLD }}>
              privacy@trikalvaani.com
            </a>.
            We will respond within 30 days.
          </p>
        </Section>

        <Section title="8. Data Security">
          <p>
            We implement industry-standard security measures including TLS encryption, Row-Level Security (RLS) in our database, and access controls. However, no transmission over the internet is 100% secure and we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>
            The Platform is not directed at children under the age of 13. We do not knowingly collect personal data from children. If you believe a child has submitted data, please contact us immediately.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy periodically. Changes will be posted on this page with a revised effective date. Continued use of the Platform after changes constitutes acceptance.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            For privacy-related enquiries, write to:{' '}
            <a href="mailto:privacy@trikalvaani.com" className="underline" style={{ color: GOLD }}>
              privacy@trikalvaani.com
            </a>
            {' '}or refer to our{' '}
            <Link href="/terms" className="underline" style={{ color: GOLD }}>Terms of Service</Link>.
          </p>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
