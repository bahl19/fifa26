import { NextResponse } from 'next/server';
import { getStandings, getSchedule, getScorers } from '@/lib/espn';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const [standings, schedule, scorers] = await Promise.all([
      getStandings(),
      getSchedule(),
      getScorers(),
    ]);

    const nextMatch = schedule?.find((m: any) => m.status === 'SCHEDULED' || m.status === 'STATUS_SCHEDULED') || null;

    return NextResponse.json({
      status: 'online',
      last_updated: new Date().toISOString(),
      next_match: nextMatch ? `${nextMatch.home} vs ${nextMatch.away}` : 'No upcoming matches',
      data_status: {
        standings: standings ? 'ok' : 'error',
        schedule: schedule ? 'ok' : 'error',
        scorers: scorers ? 'ok' : 'error',
      }
    });
  } catch {
    return NextResponse.json({ status: 'error', last_updated: new Date().toISOString() });
  }
}
