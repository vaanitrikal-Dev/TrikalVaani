import Link from 'next/link';
import type { Metadata } from 'next';
import SiteNav from '@/components/layout/SiteNav';
import SiteFooter from '@/components/layout/SiteFooter';

export const metadata: Metadata = {
  title: 'Refund Policy | Trikal Vaani',
  description: 'Refund and cancellation policy for Trikal Vaani paid reports and premium services.',
  alternates: { canonical: 'https://trikalvaani.com/refund' },
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

function PolicyCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'rgba(6,10,24,0.7)',
        border: `1px solid ${GOLD_RGBA(0.12)}`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
          style={{ background: GOLD_RGBA(0.08), border: `1px solid ${GOLD_RGBA(0.2)}` }}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-white mb-1">{title}</p>
          <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  );
}

export default function RefundPage() {
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
            Refund Policy
          </h1>
          <p className="text-sm text-slate-500">
            Effective Date: 1 January 2025 &nbsp;·&nbsp; Last Updated: 1 April 2025
          </p>
          <div
            className="mt-6 h-px w-16"
            style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <PolicyCard
            icon="✦"
            title="Free Analysis"
            body="Always 100% free — no payment or refund applicable."
          />
          <PolicyCard
            icon="◈"
            title="Paid Reports"
            body="Eligible for refund within 48 hours if report was not delivered."
          />
          <PolicyCard
            icon="◉"
            title="Premium Coaching"
            body="Cancellations accepted up to 24 hours before scheduled session."
          />
        </div>

        <Section title="1. Free Services">
          <p>
            All core Trikal Vaani analyses — Daily Energy Score, Life Pillar Scores, Nakshatra insights, and Dasha summaries — are provided free of charge and require no payment. No refund policy applies to free services.
          </p>
        </Section>

        <Section title="2. Paid Digital Reports">
          <p>
            Trikal Vaani offers optional paid upgrades including Deep Dive Reports, Full Kundali PDF, and Varshphal Annual Reports (&ldquo;Digital Products&rdquo;). These are delivered digitally within minutes of payment confirmation.
          </p>
          <p>
            Because Digital Products are delivered immediately upon purchase, <strong className="text-white">all sales are final</strong> once the report has been delivered to your email or displayed on screen.
          </p>
          <p>
            <strong className="text-white">Exception:</strong> If your report was not delivered within 2 hours of payment, you are entitled to a full refund. Contact us within 48 hours of purchase with your order ID.
          </p>
        </Section>

        <Section title="3. Premium Coaching Sessions">
          <p>
            Live 1-on-1 coaching sessions with a Trikal Vaani-certified Vedic Astrologer may be booked through the Platform (when available).
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong className="text-white">Cancellation 24+ hours before session:</strong> Full refund or credit.</li>
            <li><strong className="text-white">Cancellation within 24 hours:</strong> 50% refund or full credit for rescheduling.</li>
            <li><strong className="text-white">No-show by client:</strong> No refund.</li>
            <li><strong className="text-white">No-show by astrologer:</strong> Full refund + ₹100 credit.</li>
          </ul>
        </Section>

        <Section title="4. Subscription Plans">
          <p>
            If subscription-based access is introduced in the future, a separate cancellation policy will be published. Subscribers will always be able to cancel before the next billing cycle for a pro-rated refund.
          </p>
        </Section>

        <Section title="5. How to Request a Refund">
          <p>To request a refund, email us at{' '}
            <a href="mailto:support@trikalvaani.com" className="underline" style={{ color: GOLD }}>
              support@trikalvaani.com
            </a>{' '}
            with the subject line <strong className="text-white">"Refund Request — [Your Order ID]"</strong>.
          </p>
          <p>Include:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Your full name and email used during purchase.</li>
            <li>Order / Transaction ID.</li>
            <li>Reason for refund request.</li>
          </ul>
          <p>
            We will review and respond within <strong className="text-white">3 business days</strong>. Approved refunds are processed within 5–7 business days back to your original payment method.
          </p>
        </Section>

        <Section title="6. Chargebacks & Disputes">
          <p>
            We encourage you to contact us before initiating a chargeback. Unresolved chargebacks may result in suspension of account access. We cooperate fully with payment gateway dispute resolution processes.
          </p>
        </Section>

        <Section title="7. Contact">
          <p>
            Refund queries:{' '}
            <a href="mailto:support@trikalvaani.com" className="underline" style={{ color: GOLD }}>
              support@trikalvaani.com
            </a>
            {'. '}
            See also our{' '}
            <Link href="/terms" className="underline" style={{ color: GOLD }}>Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline" style={{ color: GOLD }}>Privacy Policy</Link>.
          </p>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
