import { supabase } from './supabase';

export async function signUpWithEmail(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data.user) return { error };

  await supabase.from('user_profiles').insert({
    id: data.user.id,
    display_name: name,
    email,
  });

  return { data };
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUserProfile(userId: string) {
  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return data;
}

export async function updateLastSessionContext(userId: string, context: Record<string, unknown>) {
  await supabase
    .from('user_profiles')
    .update({ last_session_context: context, updated_at: new Date().toISOString() })
    .eq('id', userId);
}

export async function getSavedCharts(userId: string) {
  const { data } = await supabase
    .from('saved_charts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function saveChart(userId: string, chart: {
  name: string;
  dob: string;
  birth_time: string;
  city: string;
  energy_score: number;
  pillar_scores: Record<string, number>;
  selected_question: string;
  analysis_summary: string;
}) {
  const { data, error } = await supabase
    .from('saved_charts')
    .insert({ user_id: userId, ...chart })
    .select('id')
    .maybeSingle();
  return { data, error };
}

export async function deleteChart(chartId: string) {
  return supabase.from('saved_charts').delete().eq('id', chartId);
}
