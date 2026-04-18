import { NextRequest } from 'next/server';

export { POST } from '../jini-chat/route';

export async function GET(_req: NextRequest) {
  return new Response(JSON.stringify({ status: 'Jini Chat API is live', model: 'gemini-1.5-pro' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
