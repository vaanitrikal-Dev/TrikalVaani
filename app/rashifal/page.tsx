// ════════════════════════════════════════════════════════════════════
// 🔱 TRIKAAL VAANI — File: app/rashifal/page.tsx  (v1.0)
// Owner: Rohiit Gupta, Chief Vedic Architect
// /rashifal → redirects to today's IST date → /rashifal/YYYY-MM-DD
// ════════════════════════════════════════════════════════════════════
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function todayIST(): string {
  const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  return now.toISOString().split("T")[0];
}

export default function RashifalIndex() {
  redirect(`/rashifal/${todayIST()}`);
}
