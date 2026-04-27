/**
 * FILE: app/api/prediction/route.ts
 * Trikal Vaani — Fetch Prediction by ID or SessionId
 * CEO: Rohiit Gupta | Chief Vedic Architect
 * Version: 1.0 | Date: 2026-04-27
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const predictionId = searchParams.get('predictionId');
  const sessionId    = searchParams.get('sessionId');

  try {
    if (predictionId) {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('id', predictionId)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    if (sessionId) {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'predictionId or sessionId required' }, { status: 400 });

  } catch (err) {
    console.error('[TV] Prediction fetch error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
