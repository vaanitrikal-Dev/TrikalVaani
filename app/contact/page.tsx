/**
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE TO PASTE → app/contact/page.tsx (CREATE NEW)
 * Version: 1.0 — Full SEO + Razorpay compliant
 */

import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "Contact Us | Trikal Vaani",
  description: "Contact Rohiit Gupta and the Trikal Vaani team. WhatsApp, email, and booking details for Vedic astrology consultations. Delhi NCR, India.",
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  alternates: { canonical: "https://trikalvaani.com/contact" },
  openGraph: { title: "Contact Us | Trikal Vaani", url: "https://trikalvaani.com/contact", siteName: "Trikal Vaani", locale: "en_IN", type: "website" },
};

const GOLD = "#D4AF37";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#080B12] text-white">
      <SiteNav />

      <section className="pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">

          <div className="mb-14 text-center">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: GOLD }}>Get in Touch</p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
            <p className="text-gray-400 max-w-xl mx-auto text-sm">Whether you need help with a reading, want to book a personal consultation with Rohiit ji, or have a business enquiry — we respond within 24 hours.</p>
          </div>

          {/* Primary contact cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-14">
            <a href="https://wa.me/919211804111?text=Hi%20Rohiit%20ji%2C%20I%20need%20help%20with%20my%20Trikal%20Vaani%20reading" target="_blank" rel="noopener noreferrer" className="border rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 group" style={{ borderColor: "rgba(37,211,102,0.4)", background: "rgba(37,211,102,0.05)" }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">💬</span>
                <div>
                  <p className="text-green-400 font-bold">WhatsApp</p>
                  <p className="text-gray-500 text-xs">Fastest response</p>
                </div>
              </div>
              <p className="text-white font-semibold text-lg mb-1">+91 92118 04111</p>
              <p className="text-gray-400 text-sm mb-4">Available 9 AM – 9 PM IST, Monday to Saturday</p>
              <p className="text-green-400 text-sm font-medium group-hover:underline">Message Now →</p>
            </a>

            <a href="mailto:rohiit@trikalvaani.com" className="border border-white/10 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 group" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📧</span>
                <div>
                  <p className="text-white font-bold">Email</p>
                  <p className="text-gray-500 text-xs">For detailed enquiries</p>
                </div>
              </div>
              <p className="text-white font-semibold text-lg mb-1">rohiit@trikalvaani.com</p>
              <p className="text-gray-400 text-sm mb-4">Response within 24 hours on working days</p>
              <p className="text-sm font-medium group-hover:underline" style={{ color: GOLD }}>Send Email →</p>
            </a>
          </div>

          {/* Business details for Razorpay */}
          <div className="rounded-2xl p-8 mb-10" style={{ border: `1px solid rgba(212,175,55,0.2)`, background: `rgba(212,175,55,0.05)` }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: GOLD }}>Business Details</p>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Platform</p>
                  <p className="text-white font-semibold">Trikal Vaani</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Founder & Chief Vedic Architect</p>
                  <p className="text-white font-semibold">Rohiit Gupta</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Website</p>
                  <p style={{ color: GOLD }}>trikalvaani.com</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Location</p>
                  <p className="text-white">Delhi NCR, India</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Services</p>
                  <p className="text-white">AI-powered Vedic Astrology Readings</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Payment</p>
                  <p className="text-white">Razorpay — UPI, Cards, Net Banking</p>
                </div>
              </div>
            </div>
          </div>

          {/* Help topics */}
          <div className="mb-14">
            <h2 className="font-serif text-xl font-bold text-white mb-6">How Can We Help?</h2>
            <div className="space-y-3">
              {[
                { icon: "🔮", title: "Reading Support", desc: "Issues with accessing or understanding your Jini AI reading", wa: "I%20need%20help%20with%20my%20reading" },
                { icon: "📞", title: "Book Personal Consultation", desc: "Schedule a ₹499 personal call with Rohiit Gupta", wa: "I%20want%20to%20book%20a%20personal%20consultation%20at%20Rs499" },
                { icon: "💳", title: "Payment Issue", desc: "Payment failed, double charge, or refund request", wa: "I%20have%20a%20payment%20issue" },
                { icon: "🙏", title: "Maa Shakti Arzi / Dhanyewaad", desc: "Submit your prayer or gratitude offering to Maa Shakti", wa: "I%20want%20to%20submit%20my%20Arzi%20to%20Maa%20Shakti" },
                { icon: "🤝", title: "Business Enquiry", desc: "Partnerships, collaborations, or media enquiries", wa: "I%20have%20a%20business%20enquiry%20for%20Trikal%20Vaani" },
              ].map((item, i) => (
                <a key={i} href={`https://wa.me/919211804111?text=Hi%20Rohiit%20ji%2C%20${item.wa}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 border border-white/10 rounded-xl p-4 transition-all duration-200 group hover:bg-white/[0.03]">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm">{item.title}</p>
                    <p className="text-gray-500 text-xs">{item.desc}</p>
                  </div>
                  <span className="text-sm flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: GOLD }}>→</span>
                </a>
              ))}
            </div>
          </div>

          {/* Legal links */}
          <div className="border-t border-white/10 pt-8 flex flex-wrap gap-6">
            <Link href="/privacy" className="text-sm hover:underline" style={{ color: GOLD }}>Privacy Policy</Link>
            <Link href="/terms" className="text-sm hover:underline" style={{ color: GOLD }}>Terms of Service</Link>
            <Link href="/refund" className="text-sm hover:underline" style={{ color: GOLD }}>Refund Policy</Link>
            <Link href="/services" className="text-gray-500 text-sm hover:text-gray-300">All Services</Link>
            <Link href="/founder" className="text-gray-500 text-sm hover:text-gray-300">About Rohiit Gupta</Link>
          </div>

        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
