// ============================================================
//  Trikaal Vaani — Vivah Muhurat (index → current year)
//  File: app/vivah-muhurat/page.tsx
//  Redirects /vivah-muhurat to the most relevant seeded year,
//  so nav/links never need a yearly update.
// ============================================================

import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 86400;

export default async function VivahMuhuratIndex() {
  let target = new Date().getFullYear();
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data } = await supabase.from('muhurat_windows').select('year');
    const years = Array.from(new Set((data ?? []).map((r: any) => Number(r.year)))).sort((a, b) => a - b);
    if (years.length) {
      const now = new Date().getFullYear();
      target = years.includes(now) ? now : (years.find((y) => y > now) ?? years[years.length - 1]);
    }
  } catch { /* fall back to current calendar year */ }

  redirect(`/vivah-muhurat/${target}`);
}
