/**
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE TO PASTE → app/refund/page.tsx (REPLACE EXISTING)
 * Version: 2.0 — Full SEO + EEAT + Razorpay compliant
 */

import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Trikal Vaani",
  description: "Refund and Cancellation Policy for Trikal Vaani. Understand when refunds apply for astrology readings and personal consultations.",
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  alternates: { canonical: "https://trikalvaani.com/refund" },
  openGraph: { title: "Refund Policy | Trikal Vaani", url: "https://trikalvaani.com/refund", siteName: "Trikal Vaani", locale: "en_IN", type: "website" },
};

const GOLD = "#D4AF37";

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-[#080B12] text-white">
      <SiteNav />

      <section className="pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">

          <div className="mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: GOLD }}>Legal</p>
            <h1 className="font-serif text-4xl font-bold text-white mb-4">Refund & Cancellation Policy</h1>
            <p className="text-gray-500 text-sm">Effective: 1 January 2025 · Last Updated: April 2025</p>
            <p className="text-gray-500 text-sm mt-1">Operated by: <span style={{ color: GOLD }}>Rohiit Gupta</span> — Trikal Vaani, Delhi NCR, India</p>
            <div className="mt-6 h-px w-16" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
          </div>

          <div className="space-y-10 text-gray-400 text-sm leading-relaxed">

            {/* Quick summary */}
            <div className="border rounded-xl p-6" style={{ borderColor: `rgba(212,175,55,0.3)`, background: `rgba(212,175,55,0.05)` }}>
              <p className="font-semibold mb-3" style={{ color: GOLD }}>Quick Summary</p>
              <ul className="space-y-2">
                {[
                  { icon: "✅", text: "Technical failure preventing delivery → Full refund within 5-7 days" },
                  { icon: "✅", text: "Payment captured but reading not generated → Full refund" },
                  { icon: "✅", text: "Personal call (₹499) cancelled 24hrs before → Full refund" },
                  { icon: "❌", text: "Reading delivered successfully → No refund" },
                  { icon: "❌", text: "Personal call (₹499) cancelled less than 24hrs → No refund" },
                  { icon: "❌", text: "Maa Shakti dakshina → Non-refundable once prayer transmitted" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 list-none">
                    <span className="flex-shrink-0">{item.icon}</span>{item.text}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>1. Digital Readings (₹51 and ₹99)</h2>
              <p className="mb-4">Digital astrology readings are personalised content generated specifically for your birth chart. Due to the nature of digital goods:</p>
              <ul className="space-y-3">
                {[
                  { icon: "✅", strong: "Eligible for refund:", text: "Technical error on our side prevents reading generation and delivery after successful payment." },
                  { icon: "✅", strong: "Eligible for refund:", text: "Payment was captured but the reading was never generated due to a system failure." },
                  { icon: "❌", strong: "Not eligible for refund:", text: "Reading was successfully generated and delivered, regardless of whether you agree with the content." },
                  { icon: "❌", strong: "Not eligible for refund:", text: "Incorrect birth details were provided by the user." },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 list-none">
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span><strong className="text-white">{item.strong}</strong> {item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>2. Personal Consultation with Rohiit Gupta (₹499)</h2>
              <ul className="space-y-3">
                {[
                  { icon: "✅", strong: "Full refund:", text: "You cancel your booking more than 24 hours before the scheduled consultation." },
                  { icon: "✅", strong: "Full refund:", text: "Rohiit Gupta is unable to conduct the consultation for any reason on our end." },
                  { icon: "❌", strong: "No refund:", text: "You cancel less than 24 hours before the scheduled consultation." },
                  { icon: "❌", strong: "No refund:", text: "You do not attend the scheduled consultation without prior notice." },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 list-none">
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span><strong className="text-white">{item.strong}</strong> {item.text}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4">To cancel or reschedule, WhatsApp: <a href="https://wa.me/919211804111" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }} className="hover:underline">+91 92118 04111</a></p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>3. Maa Shakti Dakshina (Arzi & Dhanyewaad — ₹101 onwards)</h2>
              <p>Arzi to Maa and Maa Ka Dhanyewaad dakshina offerings are voluntary spiritual devotional offerings. Once Rohiit Gupta has transmitted your prayer during Vedic mantra recitation, these offerings are <strong className="text-white">non-refundable</strong>. These are acts of devotion, not commercial transactions.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>4. Payment Failures & Double Charges</h2>
              <ul className="space-y-3">
                {[
                  { icon: "✅", strong: "Automatic refund:", text: "If your payment failed but your account was debited, Razorpay will automatically reverse the charge within 5-7 working days." },
                  { icon: "✅", strong: "Manual refund:", text: "If you were charged twice for the same order, contact us immediately and we will process a refund within 2 working days." },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 list-none">
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span><strong className="text-white">{item.strong}</strong> {item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>5. Refund Timeline</h2>
              <div className="space-y-2">
                {[
                  { type: "UPI refunds", time: "1-3 working days" },
                  { type: "Net banking refunds", time: "3-5 working days" },
                  { type: "Credit / Debit card refunds", time: "5-7 working days" },
                  { type: "Razorpay auto-reversal (failed payment)", time: "5-7 working days" },
                  { type: "Manual refund approved by us", time: "5-7 working days" },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between items-center border border-white/10 rounded-lg px-4 py-3">
                    <span className="text-gray-300">{r.type}</span>
                    <span className="font-medium text-xs" style={{ color: GOLD }}>{r.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>6. How to Request a Refund</h2>
              <p className="mb-4">Contact us within 7 days of your payment date:</p>
              <div className="border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📧</span>
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <a href="mailto:rohiit@trikalvaani.com" style={{ color: GOLD }} className="hover:underline">rohiit@trikalvaani.com</a>
                    <p className="text-gray-500 text-xs mt-1">Include: name, email, payment date, order ID, reason for refund</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">💬</span>
                  <div>
                    <p className="text-white font-medium">WhatsApp</p>
                    <a href="https://wa.me/919211804111" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }} className="hover:underline">+91 92118 04111</a>
                    <p className="text-gray-500 text-xs mt-1">Response within 24 hours on working days</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap gap-6">
            <Link href="/privacy" style={{ color: GOLD }} className="text-sm hover:underline">Privacy Policy →</Link>
            <Link href="/terms" style={{ color: GOLD }} className="text-sm hover:underline">Terms of Service →</Link>
            <Link href="/contact" className="text-gray-500 text-sm hover:text-gray-300">Contact Us →</Link>
            <Link href="/" className="text-gray-500 text-sm hover:text-gray-300">← Home</Link>
          </div>

        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
