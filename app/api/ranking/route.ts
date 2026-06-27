import { NextResponse } from 'next/server';
import { getRanking } from '@/lib/espn';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const ranking = await getRanking();
  if (!ranking) {
    return NextResponse.json({ error: 'Failed to fetch ranking' }, { status: 503 });
  }
  return NextResponse.json(ranking);
}
