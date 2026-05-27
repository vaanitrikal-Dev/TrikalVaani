/**
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE TO PASTE → app/privacy/page.tsx (REPLACE EXISTING)
 * Version: 2.0 — Full SEO + EEAT + Razorpay compliant
 */

import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy | Trikal Vaani",
  description: "Privacy Policy for Trikal Vaani — AI-powered Vedic Astrology platform by Rohiit Gupta. How we collect, use, and protect your personal data.",
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  alternates: { canonical: "https://trikalvaani.com/privacy" },
  openGraph: { title: "Privacy Policy | Trikal Vaani", url: "https://trikalvaani.com/privacy", siteName: "Trikal Vaani", locale: "en_IN", type: "website" },
};

const GOLD = "#D4AF37";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#080B12] text-white">
      <SiteNav />

      <section className="pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">

          <div className="mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: GOLD }}>Legal</p>
            <h1 className="font-serif text-4xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-gray-500 text-sm">Effective: 1 January 2025 · Last Updated: April 2025</p>
            <p className="text-gray-500 text-sm mt-1">Operated by: <span style={{ color: GOLD }}>Rohiit Gupta</span> — Trikal Vaani, Delhi NCR, India</p>
            <div className="mt-6 h-px w-16" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
          </div>

          <div className="space-y-10 text-gray-400 text-sm leading-relaxed">

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>1. Information We Collect</h2>
              <p className="mb-3">When you use Trikal Vaani, we collect the following information:</p>
              <ul className="space-y-2">
                {[
                  "Date, time, and place of birth — required for Vedic astrology calculations",
                  "Name and email address — for account creation and reading delivery",
                  "Mobile number — for WhatsApp delivery of readings and booking confirmations",
                  "Payment information — processed securely by Razorpay (we do not store card details)",
                  "Device and browser information — for performance and security",
                  "IP address — for fraud prevention and security",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 list-none">
                    <span style={{ color: GOLD }} className="flex-shrink-0 mt-0.5">✦</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>2. How We Use Your Information</h2>
              <ul className="space-y-2">
                {[
                  "To generate your personalised Vedic astrology reading using Jini AI",
                  "To deliver your reading via email or WhatsApp",
                  "To process payments and send receipts",
                  "To create and manage your account",
                  "To send booking confirmations for personal consultations with Rohiit Gupta",
                  "To improve our platform and services",
                  "To comply with legal obligations",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 list-none">
                    <span style={{ color: GOLD }} className="flex-shrink-0 mt-0.5">✦</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>3. Data Storage & Security</h2>
              <p className="mb-3">Your data is stored on Supabase (PostgreSQL) in secure data centres. We implement industry-standard security measures including:</p>
              <ul className="space-y-2">
                {[
                  "SSL/TLS encryption for all data in transit",
                  "Encrypted storage for sensitive information",
                  "Row-level security on all database tables",
                  "Regular security audits",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 list-none">
                    <span style={{ color: GOLD }} className="flex-shrink-0 mt-0.5">✦</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>4. Payment Data</h2>
              <p>All payments are processed by <strong className="text-white">Razorpay</strong> — a PCI DSS compliant payment gateway. Trikal Vaani does not store, process, or transmit your card number, CVV, or banking credentials. Razorpay&apos;s privacy policy applies to payment data: <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }} className="hover:underline">razorpay.com/privacy</a></p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>5. Third-Party Services</h2>
              <ul className="space-y-2">
                {[
                  "Razorpay — payment processing",
                  "Supabase — database and authentication",
                  "Prokerala API — Vedic astrology calculations (Lahiri Ayanamsha)",
                  "Google Gemini AI — Jini AI reading generation",
                  "Vercel — website hosting",
                  "OpenStreetMap / Nominatim — birth place geocoding",
                  "WhatsApp / Interakt — reading and booking delivery",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 list-none">
                    <span style={{ color: GOLD }} className="flex-shrink-0 mt-0.5">✦</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>6. Your Rights</h2>
              <ul className="space-y-2">
                {[
                  "Access the personal data we hold about you",
                  "Request correction of inaccurate data",
                  "Request deletion of your account and data",
                  "Withdraw consent for marketing communications",
                  "Request a copy of your data (data portability)",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 list-none">
                    <span style={{ color: GOLD }} className="flex-shrink-0 mt-0.5">✦</span>{item}
                  </li>
                ))}
              </ul>
              <p className="mt-3">To exercise any of these rights: <a href="mailto:rohiit@trikalvaani.com" style={{ color: GOLD }} className="hover:underline">rohiit@trikalvaani.com</a></p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>7. Cookies</h2>
              <p>Trikal Vaani uses essential cookies only — for authentication, session management, and security. We do not use advertising or tracking cookies.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>8. Data Retention</h2>
              <p>We retain your data for as long as your account is active. If you delete your account, your personal data will be permanently deleted within 30 days, except where required by law (payment records retained for 7 years for tax compliance).</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>9. Children&apos;s Privacy</h2>
              <p>Trikal Vaani is not directed at children under 13. We do not knowingly collect personal data from children.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>10. Contact Us</h2>
              <div className="border border-white/10 rounded-xl p-5 space-y-2" style={{ background: `rgba(212,175,55,0.04)` }}>
                <p><span className="text-white font-semibold">Rohiit Gupta</span> — Chief Vedic Architect</p>
                <p>Trikal Vaani — trikalvaani.com · Delhi NCR, India</p>
                <p>Email: <a href="mailto:rohiit@trikalvaani.com" style={{ color: GOLD }} className="hover:underline">rohiit@trikalvaani.com</a></p>
                <p>WhatsApp: <a href="https://wa.me/919211804111" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }} className="hover:underline">+91 92118 04111</a></p>
              </div>
            </div>

          </div>

          <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap gap-6">
            <Link href="/terms" style={{ color: GOLD }} className="text-sm hover:underline">Terms of Service →</Link>
            <Link href="/refund" style={{ color: GOLD }} className="text-sm hover:underline">Refund Policy →</Link>
            <Link href="/contact" className="text-gray-500 text-sm hover:text-gray-300">Contact Us →</Link>
            <Link href="/" className="text-gray-500 text-sm hover:text-gray-300">← Home</Link>
          </div>

        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
