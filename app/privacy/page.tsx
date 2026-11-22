/**
 * TRIKAL VAANI — trikalvaani.com
 * Chief Vedic Architect: Rohiit Gupta
 * FILE TO PASTE → app/privacy/page.tsx (REPLACE EXISTING)
 * Version: 2.2 (22 Nov 2026 — Google Play app launch: Play Billing, voice recordings,
 *   palm photos, AI processors (Gemini, ElevenLabs), analytics/ads cookies (GA4, Google Ads,
 *   Meta Pixel), OneSignal push, and a "Delete your account" section (#delete-account) whose
 *   link goes into Play Console. Approved by Rohiit 22 Nov 2026.)
 * Prior: 2.1 (1 Oct 2026 — core tagline) — Full SEO + EEAT + Razorpay compliant
 */

import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/layout/SiteNav";
import SiteFooter from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | Trikaal Vaani" },
  description: "Privacy Policy for Trikaal Vaani — granth-based, Rohiit-verified, AI-powered Vedic Astrology platform by Rohiit Gupta. How we collect, use, and protect your personal data.",
  authors: [{ name: "Rohiit Gupta", url: "https://trikalvaani.com/founder" }],
  alternates: { canonical: "https://trikalvaani.com/privacy" },
  openGraph: { title: "Privacy Policy | Trikaal Vaani", url: "https://trikalvaani.com/privacy", siteName: "Trikaal Vaani", locale: "en_IN", type: "website" },
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
            <p className="text-gray-500 text-sm">Effective: 1 January 2025 · Last Updated: 22 November 2026</p>
            <p className="text-gray-500 text-sm mt-1">Operated by: <span style={{ color: GOLD }}>Rohiit Gupta</span> — Trikaal Vaani, Delhi, India</p>
            <p className="text-gray-500 text-sm mt-1">Applies to trikalvaani.com and the Trikaal Vaani Android app (com.trikalvaani.app) on Google Play.</p>
            <div className="mt-6 h-px w-16" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
          </div>

          <div className="space-y-10 text-gray-400 text-sm leading-relaxed">

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>1. Information We Collect</h2>
              <p className="mb-3">When you use Trikaal Vaani, we collect the following information:</p>
              <ul className="space-y-2">
                {[
                  "Date, time, and place of birth — required for Vedic astrology calculations",
                  "Name and email address — for account creation and reading delivery",
                  "Mobile number — for WhatsApp delivery of readings and booking confirmations",
                  "Voice recordings — when you ask a question by voice in Trikaal Voice (used only to convert your speech to text)",
                  "Palm photos — when you use the Hast Rekha (palm reading) report",
                  "Payment information — processed by Razorpay, PayPal or Google Play (we do not store card or bank details)",
                  "Purchase records — order ID, product and amount, to deliver what you paid for",
                  "Device and browser information — for performance and security",
                  "IP address and approximate country — for fraud prevention, security and showing prices in the right currency",
                  "Usage data — pages visited and actions taken, through analytics cookies (see section 8)",
                  "Push notification token — only if you allow notifications",
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
                  "To generate your personalised Vedic astrology reading using Trikaal AI",
                  "To deliver your reading via email or WhatsApp",
                  "To process payments, verify Google Play purchases and send receipts",
                  "To turn your voice question into text and reply with a spoken answer",
                  "To analyse your palm photo for the Hast Rekha report",
                  "To send notifications you have allowed (for example daily Panchang)",
                  "To measure site traffic and the performance of our advertising",
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
              <p className="mb-3">On the website, payments are processed by <strong className="text-white">Razorpay</strong> (India) and <strong className="text-white">PayPal</strong> (international) — both PCI DSS compliant. Razorpay&apos;s privacy policy: <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }} className="hover:underline">razorpay.com/privacy</a></p>
              <p className="mb-3">In the Trikaal Vaani Android app, purchases are processed by <strong className="text-white">Google Play Billing</strong>. Google handles your payment method; we receive only the order details (order ID, product, purchase token) needed to verify the purchase and unlock your report. Google&apos;s privacy policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: GOLD }} className="hover:underline">policies.google.com/privacy</a></p>
              <p>Trikaal Vaani never stores your card number, CVV, UPI PIN or banking credentials.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>5. Third-Party Services</h2>
              <ul className="space-y-2">
                {[
                  "Razorpay and PayPal — website payment processing",
                  "Google Play Billing — in-app purchases in the Android app",
                  "Supabase — database, authentication and file storage",
                  "self-hosted Swiss Ephemeris — Vedic astrology calculations (Lahiri Ayanamsha)",
                  "Google Gemini AI — reading generation, voice-to-text and palm photo analysis",
                  "ElevenLabs — spoken voice replies in Trikaal Voice",
                  "Google Analytics and Google Ads — traffic and advertising measurement",
                  "Meta (Facebook) Pixel — advertising measurement",
                  "OneSignal — push notifications (only if you allow them)",
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
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>6. Voice Recordings &amp; Palm Photos</h2>
              <ul className="space-y-2">
                {[
                  "Voice: your recording is sent securely to Google Gemini only to convert it to text. We do not store the audio file, and the text of your question is used only to prepare your answer.",
                  "Microphone access is used only while you hold the mic button in Trikaal Voice. You can deny or remove the permission at any time in your phone or browser settings.",
                  "Palm photos: used only to prepare your Hast Rekha report. A photo is kept temporarily so the report can be retried if generation fails, and is deleted once your report is delivered.",
                  "We never sell voice recordings, photos or any personal data.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 list-none">
                    <span style={{ color: GOLD }} className="flex-shrink-0 mt-0.5">✦</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>7. Your Rights</h2>
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
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>8. Cookies &amp; Analytics</h2>
              <p className="mb-3">We use essential cookies for login, sessions and security. We also use analytics and advertising cookies from Google Analytics, Google Ads and Meta (Facebook) Pixel to understand how visitors use the site and to measure our advertising.</p>
              <p>These cookies do not contain your birth details or readings. You can block or delete cookies in your browser settings; the site will still work.</p>
            </div>

            <div id="delete-account" className="scroll-mt-28">
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>9. Delete Your Account &amp; Data</h2>
              <p className="mb-3">This applies to both trikalvaani.com and the Trikaal Vaani Android app (com.trikalvaani.app). To delete your account and personal data:</p>
              <ul className="space-y-2">
                {[
                  "Email rohiit@trikalvaani.com with the subject \"Delete my account\", or send the same message on WhatsApp to +91 92118 04111.",
                  "Write the email address or mobile number you used on Trikaal Vaani, so we can find your account.",
                  "We confirm your request and delete your account within 30 days.",
                  "What is deleted: your profile, birth details, saved readings, palm photos and remaining voice-question credits.",
                  "What is kept: payment and invoice records, for 7 years, because Indian tax law requires it. These are not used for any other purpose.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 list-none">
                    <span style={{ color: GOLD }} className="flex-shrink-0 mt-0.5">✦</span>{item}
                  </li>
                ))}
              </ul>
              <p className="mt-3">You can also ask us to delete only some data (for example one reading) without closing your account.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>10. Data Retention</h2>
              <p>We retain your data for as long as your account is active. If you delete your account, your personal data will be permanently deleted within 30 days, except where required by law (payment records retained for 7 years for tax compliance).</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>11. Children&apos;s Privacy</h2>
              <p>Trikaal Vaani is meant for users aged 18 and above. It is not directed at children, and we do not knowingly collect personal data from anyone under 18.</p>
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold mb-4" style={{ color: GOLD }}>12. Contact Us</h2>
              <div className="border border-white/10 rounded-xl p-5 space-y-2" style={{ background: `rgba(212,175,55,0.04)` }}>
                <p><span className="text-white font-semibold">Rohiit Gupta</span> — Chief Vedic Architect</p>
                <p>Trikaal Vaani — trikalvaani.com · Delhi NCR, India</p>
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
