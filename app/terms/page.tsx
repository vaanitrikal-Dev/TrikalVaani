/**
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE TO PASTE → app/terms-conditions/page.tsx
 * Version: 1.0 — Required for Razorpay verification
 */

import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Terms & Conditions | Trikal Vaani",
  description: "Terms and Conditions for using Trikal Vaani — AI-powered Vedic Astrology platform by Rohiit Gupta.",
  alternates: { canonical: "https://trikalvaani.com/terms-conditions" },
};

export default function TermsConditionsPage() {
  return (
    <main className="min-h-screen bg-[#080B12] text-white">
      <SiteNav />

      <section className="pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">

          <div className="mb-12">
            <p className="text-[#D4AF37] uppercase tracking-widest text-sm font-medium mb-3">Legal</p>
            <h1 className="font-serif text-4xl font-bold text-white mb-4">Terms & Conditions</h1>
            <p className="text-gray-400 text-sm">Last updated: April 2025</p>
            <p className="text-gray-400 text-sm mt-1">
              Operated by: <span className="text-[#D4AF37]">Rohiit Gupta</span> — Trikal Vaani, Delhi NCR, India
            </p>
          </div>

          <div className="space-y-10 text-gray-300 text-sm leading-relaxed">

            <div>
              <h2 className="font-serif text-xl font-bold text-[#D4AF37] mb-4">1. Acceptance of Terms</h2>
              <p>By accessing or using Trikal Vaani (trikalvaani.com), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform. These terms apply to all visitors, users, and paying customers.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold text-[#D4AF37] mb-4">2. About Our Services</h2>
              <p className="mb-3">Trikal Vaani provides AI-powered Vedic astrology readings and consultations including:</p>
              <ul className="space-y-2 list-none">
                {[
                  "Free Kundali and Panchang generation",
                  "Jini AI deep readings (₹51) — powered by Gemini AI and Swiss Ephemeris",
                  "Premium PDF readings with 4-week forecast (₹99)",
                  "Personal consultation with Rohiit Gupta (₹499)",
                  "Maa Shakti Arzi and Dhanyewaad dakshina offerings (₹101 onwards)",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#D4AF37] flex-shrink-0 mt-0.5">✦</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold text-[#D4AF37] mb-4">3. Nature of Astrology Services</h2>
              <p className="mb-3">Please read this section carefully:</p>
              <ul className="space-y-2 list-none">
                {[
                  "Vedic astrology readings are provided for guidance, entertainment, and self-reflection purposes only",
                  "Readings do not constitute professional financial, medical, legal, or psychological advice",
                  "Trikal Vaani does not guarantee specific outcomes based on astrology readings",
                  "You are solely responsible for decisions made based on readings provided",
                  "Accuracy of readings depends significantly on the accuracy of birth details provided",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#D4AF37] flex-shrink-0 mt-0.5">✦</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold text-[#D4AF37] mb-4">4. User Responsibilities</h2>
              <ul className="space-y-2 list-none">
                {[
                  "You must provide accurate birth details for readings to be meaningful",
                  "You must be at least 18 years of age to make purchases",
                  "You are responsible for maintaining the security of your account credentials",
                  "You must not use our platform for any unlawful or harmful purpose",
                  "You must not attempt to reverse-engineer or misuse our AI systems",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#D4AF37] flex-shrink-0 mt-0.5">✦</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold text-[#D4AF37] mb-4">5. Payments</h2>
              <p className="mb-3">All payments are processed securely by Razorpay. By making a payment, you agree to:</p>
              <ul className="space-y-2 list-none">
                {[
                  "Provide accurate payment information",
                  "Razorpay's terms of service and privacy policy",
                  "That payments are in Indian Rupees (INR) unless otherwise stated",
                  "That international payment charges may apply for non-INR transactions",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#D4AF37] flex-shrink-0 mt-0.5">✦</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold text-[#D4AF37] mb-4">6. Refunds</h2>
              <p>Please refer to our <Link href="/refund-policy" className="text-[#D4AF37] hover:underline">Refund Policy</Link> for complete details on refunds and cancellations. In summary: digital readings that have been delivered are generally non-refundable. Technical failures that prevent delivery will be refunded within 5-7 working days.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold text-[#D4AF37] mb-4">7. Intellectual Property</h2>
              <p>All content on Trikal Vaani — including but not limited to the Jini AI reading framework, Vedic methodology designed by Rohiit Gupta, website design, text, and graphics — is the intellectual property of Trikal Vaani. You may not reproduce, distribute, or commercially exploit any content without written permission.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold text-[#D4AF37] mb-4">8. Maa Shakti Dakshina Offerings</h2>
              <p>Arzi to Maa and Maa Ka Dhanyewaad dakshina offerings are voluntary spiritual offerings starting at ₹101 with no upper limit. These are not fees for services — they are devotional offerings. Rohiit Gupta acts as an intermediary, transmitting prayers during Vedic rituals. These offerings are non-refundable once the prayer transmission has been performed.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold text-[#D4AF37] mb-4">9. Limitation of Liability</h2>
              <p>To the maximum extent permitted by applicable law, Trikal Vaani and Rohiit Gupta shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services, including but not limited to decisions made based on astrology readings.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold text-[#D4AF37] mb-4">10. Governing Law</h2>
              <p>These Terms and Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Delhi, India.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold text-[#D4AF37] mb-4">11. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Continued use of Trikal Vaani after changes constitutes acceptance of the new terms.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold text-[#D4AF37] mb-4">12. Contact</h2>
              <div className="border border-[#D4AF37]/20 rounded-xl p-5 bg-[#D4AF37]/5 space-y-2">
                <p><span className="text-white font-semibold">Rohiit Gupta</span> — Chief Vedic Architect</p>
                <p>Trikal Vaani — trikalvaani.com</p>
                <p>Delhi NCR, India</p>
                <p>Email: <a href="mailto:rohiit@trikalvaani.com" className="text-[#D4AF37] hover:underline">rohiit@trikalvaani.com</a></p>
                <p>WhatsApp: <a href="https://wa.me/919211804111" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:underline">+91 92118 04111</a></p>
              </div>
            </div>

          </div>

          <div className="mt-14 pt-8 border-t border-white/10 flex gap-6">
            <Link href="/privacy-policy" className="text-[#D4AF37] text-sm hover:underline">Privacy Policy →</Link>
            <Link href="/refund-policy" className="text-[#D4AF37] text-sm hover:underline">Refund Policy →</Link>
            <Link href="/" className="text-gray-500 text-sm hover:text-gray-300">← Home</Link>
          </div>

        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
