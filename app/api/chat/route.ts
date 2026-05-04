import { NextRequest } from 'next/server';

export { POST } from '../Trikal-chat/route';

export async function GET(_req: NextRequest) {
  return new Response(JSON.stringify({ status: 'Trikal Chat API is live', model: 'gemini-2.5-flash' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
