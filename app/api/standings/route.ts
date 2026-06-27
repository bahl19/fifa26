import { NextResponse } from 'next/server';
import { getStandings } from '@/lib/espn';

export const dynamic = 'force-dynamic';

export async function GET() {
  const standings = await getStandings();
  if (!standings) {
    return NextResponse.json({ error: 'Failed to fetch standings' }, { status: 503 });
  }
  return NextResponse.json(standings);
}
