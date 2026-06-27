// app/api/palmistry/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { callVM } from '@/lib/callVM';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await callVM('/palmistry/analyze', {
      method: 'POST',
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Analysis failed' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
