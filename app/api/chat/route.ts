import { NextResponse } from 'next/server';
import { handleChat } from '@/lib/espn';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = body.query || body.message || '';
    const response = await handleChat(query);
    return NextResponse.json({ response });
  } catch {
    return NextResponse.json({ response: 'Sorry, something went wrong. Try again!' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Chat API is running. POST to /api/chat with { "query": "your question" }' });
}
