// app/api/social/publish-facebook/route.ts
// TRIKAL VAANI - Facebook Auto-Publish Route v1.0
// Uploads video to Facebook Page as Reel
// CEO: Rohiit Gupta | Chief Vedic Architect

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const SECRET = process.env.CONTENT_ENGINE_SECRET || 'trikal-content-engine-2026';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('x-content-engine-secret');
  if (authHeader !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { video_url, caption, festival_name, festival_date } = body;

    if (!video_url || !caption) {
      return NextResponse.json({ error: 'video_url and caption required' }, { status: 400 });
    }

    console.log(`[FB-PUBLISH] Starting: ${festival_name}`);

    // Step 1: Initialize video upload session
    const initResp = await fetch(
      `https://graph.facebook.com/v20.0/${FACEBOOK_PAGE_ID}/videos`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_url: video_url,
          description: caption,
          published: true,
          access_token: META_ACCESS_TOKEN,
        }),
      }
    );

    const initData = await initResp.json();
    console.log(`[FB-PUBLISH] Response:`, JSON.stringify(initData));

    if (initData.error) {
      throw new Error(`Facebook API error: ${initData.error.message}`);
    }

    const videoId = initData.id;
    const fbUrl = `https://www.facebook.com/${FACEBOOK_PAGE_ID}/videos/${videoId}`;
    console.log(`[FB-PUBLISH] Live: ${fbUrl}`);

    // Log to Supabase
    try {
      await supabase.from('social_publish_log')
        .update({
          status: 'success',
          platform_url: fbUrl,
          published_at: new Date().toISOString(),
        })
        .eq('video_public_url', video_url)
        .eq('platform', 'facebook');
    } catch (e) {
      console.error('[FB-PUBLISH] Supabase log failed:', e);
    }

    return NextResponse.json({
      success: true,
      video_id: videoId,
      facebook_url: fbUrl,
    });

  } catch (err: any) {
    console.error('[FB-PUBLISH] FATAL:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Facebook Publish Route v1.0',
    page_id: FACEBOOK_PAGE_ID,
    timestamp: new Date().toISOString(),
  });
}
