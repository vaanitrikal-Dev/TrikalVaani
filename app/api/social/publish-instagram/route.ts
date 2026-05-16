// app/api/social/publish-instagram/route.ts
// TRIKAL VAANI - Instagram Reels Auto-Publish Route v1.0
// Two-step: Create container -> Publish reel
// CEO: Rohiit Gupta | Chief Vedic Architect

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

const SECRET = process.env.CONTENT_ENGINE_SECRET || 'trikal-content-engine-2026';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

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

    console.log(`[IG-PUBLISH] Starting: ${festival_name}`);

    // STEP 1: Create media container
    const containerResp = await fetch(
      `https://graph.facebook.com/v20.0/${INSTAGRAM_ACCOUNT_ID}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'REELS',
          video_url: video_url,
          caption: caption.slice(0, 2200),
          share_to_feed: true,
          access_token: META_ACCESS_TOKEN,
        }),
      }
    );

    const containerData = await containerResp.json();
    console.log(`[IG-PUBLISH] Container response:`, JSON.stringify(containerData));

    if (containerData.error) {
      throw new Error(`Container creation failed: ${containerData.error.message}`);
    }

    const creationId = containerData.id;
    console.log(`[IG-PUBLISH] Container created: ${creationId}`);

    // STEP 2: Wait for Instagram to process video (poll status)
    let status = 'IN_PROGRESS';
    let attempts = 0;
    while (status !== 'FINISHED' && attempts < 12) {
      await wait(10000);
      attempts++;
      const statusResp = await fetch(
        `https://graph.facebook.com/v20.0/${creationId}?fields=status_code&access_token=${META_ACCESS_TOKEN}`
      );
      const statusData = await statusResp.json();
      status = statusData.status_code || 'IN_PROGRESS';
      console.log(`[IG-PUBLISH] Status attempt ${attempts}: ${status}`);
      if (status === 'ERROR') {
        throw new Error(`Instagram video processing failed: ${JSON.stringify(statusData)}`);
      }
    }

    if (status !== 'FINISHED') {
      throw new Error(`Instagram processing timeout after ${attempts} attempts`);
    }

    // STEP 3: Publish the container
    const publishResp = await fetch(
      `https://graph.facebook.com/v20.0/${INSTAGRAM_ACCOUNT_ID}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: META_ACCESS_TOKEN,
        }),
      }
    );

    const publishData = await publishResp.json();
    console.log(`[IG-PUBLISH] Publish response:`, JSON.stringify(publishData));

    if (publishData.error) {
      throw new Error(`Publish failed: ${publishData.error.message}`);
    }

    const mediaId = publishData.id;
    const igUrl = `https://www.instagram.com/reel/${mediaId}`;
    console.log(`[IG-PUBLISH] LIVE: ${igUrl}`);

    try {
      await supabase.from('social_publish_log')
        .update({
          status: 'success',
          platform_url: igUrl,
          published_at: new Date().toISOString(),
        })
        .eq('video_public_url', video_url)
        .eq('platform', 'instagram');
    } catch (e) {
      console.error('[IG-PUBLISH] Supabase log failed:', e);
    }

    return NextResponse.json({
      success: true,
      media_id: mediaId,
      instagram_url: igUrl,
    });

  } catch (err: any) {
    console.error('[IG-PUBLISH] FATAL:', err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Instagram Publish Route v1.0',
    instagram_account_id: INSTAGRAM_ACCOUNT_ID,
    timestamp: new Date().toISOString(),
  });
}
