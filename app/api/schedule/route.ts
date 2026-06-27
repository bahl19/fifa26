import { NextResponse } from 'next/server';
import { getSchedule } from '@/lib/espn';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const schedule = await getSchedule();
  if (!schedule) {
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 503 });
  }
  return NextResponse.json(schedule);
}
