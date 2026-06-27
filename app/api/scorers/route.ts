import { NextResponse } from 'next/server';
import { getScorers } from '@/lib/espn';

export const dynamic = 'force-dynamic';

export async function GET() {
  const scorers = await getScorers();
  if (!scorers) {
    return NextResponse.json({ error: 'Failed to fetch scorers' }, { status: 503 });
  }
  return NextResponse.json(scorers);
}
