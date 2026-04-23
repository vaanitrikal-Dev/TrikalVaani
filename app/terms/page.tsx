/**
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE TO PASTE → app/terms/page.tsx (REPLACE EXISTING)
 * Version: 2.0 — Full SEO + EEAT + Razorpay compliant
 */

import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Service | Trikal Vaani",
  description: "Terms of Service for Trikal Vaani — AI-powered Vedic Astrology platform by Rohiit Gupta. Read before using our services.",
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  alternates: { canonical: "https://trikalvaani.com/terms" },
  openGraph: { title: "Terms of Service | Trikal Vaani", url: "https://trikalvaani.com/terms", siteName: "Trikal Vaani", locale: "en_IN", type: "website" },
};

const GOLD = "#D4AF37";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#080B12] text-white">
      <SiteNav />

      <section className="pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">

          <div className="mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: GOLD }}>Legal</p>
            <h1 className="font-serif text-4xl font-bold text-white mb-4">Terms of Service</h1>
            <p className="text-gray-500 text-sm">Effective: 1 January 2025 · Last Updated: April 2025</p>
            <p className="text-gray-500 text-sm mt-1">Operated by: <span style={{ color: GOLD }}>Rohiit Gupta</span> — Trikal Vaani, Delhi NCR, India</p>
            <div className="mt-6 h-px w-16" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
          </div>

          <div className="space-y-10 text-gray-400 text-sm leading-relaxed">

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>1. Acceptance of Terms</h2>
              <p className="mb-3">By accessing or using Trikal Vaani (trikalvaani.com), you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform. These terms apply to all visitors, users, and paying customers.</p>
              <p>We reserve the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the revised terms.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>2. About Our Services</h2>
              <p className="mb-3">Trikal Vaani provides AI-powered Vedic astrology readings and consultations including:</p>
              <ul className="space-y-2">
                {[
                  "Free Kundali and Panchang generation",
                  "Jini AI deep readings (₹51) — powered by Gemini AI and Swiss Ephemeris",
                  "Premium PDF readings with 4-week forecast (₹99)",
                  "Personal consultation with Rohiit Gupta (₹499)",
                  "Maa Shakti Arzi and Dhanyewaad dakshina offerings (₹101 onwards)",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 list-none">
                    <span style={{ color: GOLD }} className="flex-shrink-0 mt-0.5">✦</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>3. Nature of Astrology Services</h2>
              <p className="mb-3">Please read this section carefully:</p>
              <ul className="space-y-2">
                {[
                  "Vedic astrology readings are provided for guidance, entertainment, and self-reflection purposes only",
                  "Readings do not constitute professional financial, medical, legal, or psychological advice",
                  "Trikal Vaani does not guarantee specific outcomes based on astrology readings",
                  "You are solely responsible for decisions made based on readings provided",
                  "Accuracy of readings depends on the accuracy of birth details provided by you",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 list-none">
                    <span style={{ color: GOLD }} className="flex-shrink-0 mt-0.5">✦</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>4. User Responsibilities</h2>
              <ul className="space-y-2">
                {[
                  "You must provide accurate birth details for readings to be meaningful",
                  "You must be at least 18 years of age to make purchases",
                  "You are responsible for maintaining the security of your account credentials",
                  "You must not use our platform for any unlawful or harmful purpose",
                  "You must not attempt to reverse-engineer or misuse our AI systems",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 list-none">
                    <span style={{ color: GOLD }} className="flex-shrink-0 mt-0.5">✦</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>5. Payments</h2>
              <p className="mb-3">All payments are processed securely by Razorpay. By making a payment, you agree to:</p>
              <ul className="space-y-2">
                {[
                  "Provide accurate payment information",
                  "Razorpay's terms of service and privacy policy",
                  "That payments are in Indian Rupees (INR) unless otherwise stated",
                  "That international payment charges may apply for non-INR transactions",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 list-none">
                    <span style={{ color: GOLD }} className="flex-shrink-0 mt-0.5">✦</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>6. Refunds</h2>
              <p>Please refer to our <Link href="/refund" style={{ color: GOLD }} className="hover:underline">Refund Policy</Link> for complete details. In summary: digital readings that have been delivered are generally non-refundable. Technical failures that prevent delivery will be refunded within 5-7 working days.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>7. Intellectual Property</h2>
              <p>All content on Trikal Vaani — including the Jini AI reading framework, Vedic methodology designed by Rohiit Gupta, website design, text, and graphics — is the intellectual property of Trikal Vaani. Reproduction or redistribution without written permission is strictly prohibited.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>8. Maa Shakti Dakshina Offerings</h2>
              <p>Arzi to Maa and Maa Ka Dhanyewaad dakshina offerings are voluntary spiritual offerings starting at ₹101 with no upper limit. These are devotional offerings, not fees for services. Once the prayer transmission has been performed, these offerings are non-refundable.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>9. Disclaimer of Warranties</h2>
              <p>The platform is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without any warranties of any kind, express or implied. We do not guarantee that predictions will be accurate or that the platform will be error-free or uninterrupted.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>10. Limitation of Liability</h2>
              <p>To the maximum extent permitted by applicable law, Trikal Vaani and Rohiit Gupta shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services, including decisions made based on astrology readings.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>11. Governing Law</h2>
              <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Delhi, India.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>12. Contact</h2>
              <div className="border border-white/10 rounded-xl p-5 space-y-2" style={{ background: `rgba(212,175,55,0.04)` }}>
                <p><span className="text-white font-semibold">Rohiit Gupta</span> — Chief Vedic Architect</p>
                <p>Trikal Vaani — trikalvaani.com · Delhi NCR, India</p>
                <p>Email: <a href="mailto:rohiit@trikalvaani.com" style={{ color: GOLD }} className="hover:underline">rohiit@trikalvaani.com</a></p>
                <p>WhatsApp: <a href="https://wa.me/919211804111" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }} className="hover:underline">+91 92118 04111</a></p>
              </div>
            </div>

          </div>

          <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap gap-6">
            <Link href="/privacy" style={{ color: GOLD }} className="text-sm hover:underline">Privacy Policy →</Link>
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
