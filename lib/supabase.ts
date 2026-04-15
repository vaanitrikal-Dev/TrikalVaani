import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export type TrikalSubmission = {
  id?: string;
  name: string;
  dob: string;
  birth_time: string;
  city: string;
  energy_score: number;
  pillar_scores: Record<string, number>;
  created_at?: string;
};

export async function saveSubmission(data: TrikalSubmission): Promise<string | null> {
  const { data: result, error } = await supabase
    .from('trikal_submissions')
    .insert([data])
    .select('id')
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    return null;
  }
  return result?.id ?? null;
}
