// app/api/social/publish-youtube/route.ts
// TRIKAL VAANI - YouTube Auto-Publish Route v1.0
// Downloads video from Supabase Storage -> Uploads to YouTube as Public Short
// CEO: Rohiit Gupta | Chief Vedic Architect

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 min (Vercel Pro allows up to 300s)
export const dynamic = 'force-dynamic';

// ============================================
// CONFIG
// ============================================
const SECRET = process.env.CONTENT_ENGINE_SECRET || 'trikal-content-engine-2026';
const YT_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID!;
const YT_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!;
const YT_REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN!;
const YT_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================
// STEP 1: GET FRESH ACCESS TOKEN
// ============================================
async function getAccessToken(): Promise<string> {
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: YT_CLIENT_ID,
      client_secret: YT_CLIENT_SECRET,
      refresh_token: YT_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Token refresh failed: ${resp.status} ${err}`);
  }

  const data = await resp.json();
  return data.access_token;
}

// ============================================
// STEP 2: DOWNLOAD VIDEO FROM SUPABASE
// ============================================
async function downloadVideo(videoUrl: string): Promise<Buffer> {
  const resp = await fetch(videoUrl);
  if (!resp.ok) {
    throw new Error(`Video download failed: ${resp.status}`);
  }
  const arrayBuffer = await resp.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ============================================
// STEP 3: UPLOAD TO YOUTUBE (Resumable Upload)
// ============================================
async function uploadToYouTube(
  videoBuffer: Buffer,
  metadata: {
    title: string;
    description: string;
    tags: string[];
    categoryId?: string;
  },
  accessToken: string
): Promise<string> {
  // Step 3a: Initiate resumable upload session
  const initResp = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': 'video/mp4',
        'X-Upload-Content-Length': videoBuffer.length.toString(),
      },
      body: JSON.stringify({
        snippet: {
          title: metadata.title.slice(0, 100), // YouTube title max 100 chars
          description: metadata.description.slice(0, 5000), // max 5000
          tags: metadata.tags.slice(0, 30), // max 30 tags
          categoryId: metadata.categoryId || '22', // 22 = People & Blogs
          defaultLanguage: 'hi',
          defaultAudioLanguage: 'hi',
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false,
          madeForKids: false,
        },
      }),
    }
  );

  if (!initResp.ok) {
    const err = await initResp.text();
    throw new Error(`YouTube init upload failed: ${initResp.status} ${err}`);
  }

  const uploadUrl = initResp.headers.get('location');
  if (!uploadUrl) {
    throw new Error('No upload URL returned from YouTube');
  }

  // Step 3b: Upload the video bytes
  const uploadResp = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Length': videoBuffer.length.toString(),
    },
    body: videoBuffer,
  });

  if (!uploadResp.ok) {
    const err = await uploadResp.text();
    throw new Error(`YouTube video upload failed: ${uploadResp.status} ${err}`);
  }

  const result = await uploadResp.json();
  return result.id; // YouTube video ID
}

// ============================================
// STEP 4: POST PINNED COMMENT (Optional)
// ============================================
async function postPinnedComment(
  videoId: string,
  commentText: string,
  accessToken: string
): Promise<boolean> {
  try {
    const resp = await fetch(
      'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            channelId: YT_CHANNEL_ID,
            videoId: videoId,
            topLevelComment: {
              snippet: {
                textOriginal: commentText.slice(0, 10000),
              },
            },
          },
        }),
      }
    );
    return resp.ok;
  } catch (e) {
    console.error('Pinned comment failed:', e);
    return false;
  }
}

// ============================================
// MAIN POST HANDLER
// ============================================
export async function POST(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get('x-content-engine-secret');
  if (authHeader !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      video_url, // Supabase public URL of MP4
      title,
      description,
      tags,
      pinned_comment,
      festival_name,
      festival_date,
    } = body;

    if (!video_url || !title) {
      return NextResponse.json(
        { error: 'video_url and title are required' },
        { status: 400 }
      );
    }

    console.log(`[YT-PUBLISH] Starting upload: ${title}`);

    // 1. Get fresh access token
    const accessToken = await getAccessToken();
    console.log('[YT-PUBLISH] Access token acquired');

    // 2. Download video from Supabase
    const videoBuffer = await downloadVideo(video_url);
    console.log(`[YT-PUBLISH] Video downloaded: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    // 3. Upload to YouTube
    const videoId = await uploadToYouTube(
      videoBuffer,
      {
        title,
        description: description || '',
        tags: tags || [],
      },
      accessToken
    );
    const youtubeUrl = `https://www.youtube.com/shorts/${videoId}`;
    console.log(`[YT-PUBLISH] Uploaded: ${youtubeUrl}`);

    // 4. Post pinned comment if provided
    let commentPosted = false;
    if (pinned_comment) {
      commentPosted = await postPinnedComment(videoId, pinned_comment, accessToken);
      console.log(`[YT-PUBLISH] Pinned comment: ${commentPosted ? 'posted' : 'failed'}`);
    }

    // 5. Update Supabase log
    try {
      await supabase
        .from('youtube_publish_log')
        .insert({
          festival_name: festival_name || null,
          festival_date: festival_date || null,
          video_url: video_url,
          youtube_video_id: videoId,
          youtube_url: youtubeUrl,
          title: title,
          pinned_comment_posted: commentPosted,
          status: 'success',
          published_at: new Date().toISOString(),
        });
    } catch (logErr) {
      console.error('[YT-PUBLISH] Supabase log failed:', logErr);
    }

    // Also update social_publish_log
    try {
      await supabase
        .from('social_publish_log')
        .update({
          status: 'success',
          platform_url: youtubeUrl,
          published_at: new Date().toISOString(),
        })
        .eq('video_public_url', video_url)
        .eq('platform', 'youtube');
    } catch (e) {
      console.error('[YT-PUBLISH] social_publish_log update failed:', e);
    }

    return NextResponse.json({
      success: true,
      video_id: videoId,
      youtube_url: youtubeUrl,
      pinned_comment_posted: commentPosted,
    });
  } catch (err: any) {
    console.error('[YT-PUBLISH] FATAL:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'YouTube Publish Route v1.0',
    channel_id: YT_CHANNEL_ID,
    timestamp: new Date().toISOString(),
  });
}
