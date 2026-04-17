import Link from 'next/link';
import type { Metadata } from 'next';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';

export const metadata: Metadata = {
  title: 'Terms of Service | Trikal Vaani',
  description: 'Terms of Service for Trikal Vaani — AI Vedic Astrology Research Platform. Read our terms before using the service.',
  alternates: { canonical: 'https://trikalvaani.com/terms' },
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

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500">
            Effective Date: 1 January 2025 &nbsp;·&nbsp; Last Updated: 1 April 2025
          </p>
          <div
            className="mt-6 h-px w-16"
            style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }}
          />
        </div>

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using Trikal Vaani (&ldquo;the Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) at trikalvaani.com, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
          <p>
            These terms apply to all visitors, users, and others who access or use the Platform. We reserve the right to update these terms at any time; continued use of the Platform constitutes acceptance of the revised terms.
          </p>
        </Section>

        <Section title="2. Nature of the Service">
          <p>
            Trikal Vaani provides AI-powered Vedic astrology analyses, life-pillar scores, and predictive insights based on birth data provided by the user. All outputs are generated algorithmically and are intended for <strong className="text-white">educational, entertainment, and research purposes only</strong>.
          </p>
          <p>
            The Platform does not constitute professional financial, legal, medical, or psychological advice. Outputs must not be used as the sole basis for any significant life decision.
          </p>
        </Section>

        <Section title="3. User Responsibilities">
          <p>You agree to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Provide accurate birth data for the most relevant analysis.</li>
            <li>Use the Platform solely for lawful, personal, and non-commercial purposes unless a commercial licence is obtained.</li>
            <li>Not attempt to reverse-engineer, scrape, or reproduce the Platform&apos;s proprietary AI models, algorithms, or datasets.</li>
            <li>Not upload, transmit, or share any content that is harmful, defamatory, or violates the rights of any third party.</li>
          </ul>
        </Section>

        <Section title="4. Intellectual Property">
          <p>
            All content on this Platform — including but not limited to text, graphics, design, AI models, Vedic algorithms, brand assets, and the Trikal Vaani name — is the exclusive property of Trikal Vaani Global and its founder Rohiit Gupta. Reproduction or redistribution without written permission is strictly prohibited.
          </p>
        </Section>

        <Section title="5. Paid Services & Unlockable Reports">
          <p>
            Certain advanced reports (Deep Dive, Full Kundali, Premium Coaching) are available for a fee. All purchases are subject to our{' '}
            <Link href="/refund" className="underline" style={{ color: GOLD }}>Refund Policy</Link>.
            Prices are listed in Indian Rupees (INR) inclusive of applicable taxes.
          </p>
        </Section>

        <Section title="6. Disclaimer of Warranties">
          <p>
            The Platform is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without any warranties of any kind, express or implied, including but not limited to accuracy, completeness, fitness for a particular purpose, or non-infringement. We do not guarantee that predictions will be accurate or that the Platform will be error-free or uninterrupted.
          </p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>
            To the fullest extent permitted by applicable law, Trikal Vaani Global shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of profits, data, or goodwill — arising from your use of the Platform or reliance on any content therein.
          </p>
        </Section>

        <Section title="8. Privacy">
          <p>
            Our collection and use of personal data is governed by our{' '}
            <Link href="/privacy" className="underline" style={{ color: GOLD }}>Privacy Policy</Link>,
            which is incorporated by reference into these Terms.
          </p>
        </Section>

        <Section title="9. Governing Law">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Delhi, India.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            For any questions regarding these Terms, please write to us at{' '}
            <a href="mailto:support@trikalvaani.com" className="underline" style={{ color: GOLD }}>
              support@trikalvaani.com
            </a>.
          </p>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
