'use client';

import { useState, useEffect, useRef } from 'react';
import { getTeamFlag, TEAMS_BY_GROUP, TEAM_FLAGS } from '../lib/data';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  group: string;
  round: string;
  date: string;
  timeUTC: string;
  status: 'upcoming' | 'live' | 'completed';
  venue: string;
  minute?: number;
}

interface GroupStanding {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
}

interface TopScorer {
  name: string;
  team: string;
  goals: number;
  assists: number;
}

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_MATCHES: Match[] = [
  // Group A
  { id: 'm1', homeTeam: 'Mexico', awayTeam: 'USA', homeScore: 2, awayScore: 1, group: 'A', round: 'group_stage', date: '2026-06-27', timeUTC: '18:00', status: 'live', venue: 'Estadio Azteca', minute: 67 },
  { id: 'm2', homeTeam: 'Canada', awayTeam: 'Costa Rica', homeScore: 1, awayScore: 1, group: 'A', round: 'group_stage', date: '2026-06-27', timeUTC: '20:00', status: 'live', venue: 'BMO Field', minute: 34 },
  // Group B
  { id: 'm3', homeTeam: 'Brazil', awayTeam: 'Argentina', homeScore: null, awayScore: null, group: 'B', round: 'group_stage', date: '2026-06-27', timeUTC: '22:00', status: 'upcoming', venue: 'SoFi Stadium' },
  { id: 'm4', homeTeam: 'Uruguay', awayTeam: 'Paraguay', homeScore: 3, awayScore: 0, group: 'B', round: 'group_stage', date: '2026-06-26', timeUTC: '20:00', status: 'completed', venue: 'MetLife Stadium' },
  // Group C
  { id: 'm5', homeTeam: 'France', awayTeam: 'Germany', homeScore: null, awayScore: null, group: 'C', round: 'group_stage', date: '2026-06-28', timeUTC: '18:00', status: 'upcoming', venue: 'Hard Rock Stadium' },
  { id: 'm6', homeTeam: 'Spain', awayTeam: 'Italy', homeScore: 2, awayScore: 2, group: 'C', round: 'group_stage', date: '2026-06-26', timeUTC: '18:00', status: 'completed', venue: 'AT&T Stadium' },
  // Group D
  { id: 'm7', homeTeam: 'England', awayTeam: 'Netherlands', homeScore: null, awayScore: null, group: 'D', round: 'group_stage', date: '2026-06-28', timeUTC: '20:00', status: 'upcoming', venue: 'Wembley Stadium' },
  { id: 'm8', homeTeam: 'Belgium', awayTeam: 'Switzerland', homeScore: 1, awayScore: 0, group: 'D', round: 'group_stage', date: '2026-06-26', timeUTC: '22:00', status: 'completed', venue: 'Lumen Field' },
  // Group E
  { id: 'm9', homeTeam: 'Japan', awayTeam: 'South Korea', homeScore: null, awayScore: null, group: 'E', round: 'group_stage', date: '2026-06-29', timeUTC: '14:00', status: 'upcoming', venue: 'Nissan Stadium' },
  { id: 'm10', homeTeam: 'Australia', awayTeam: 'Saudi Arabia', homeScore: 0, awayScore: 2, group: 'E', round: 'group_stage', date: '2026-06-26', timeUTC: '14:00', status: 'completed', venue: 'MCG' },
  // Group F
  { id: 'm11', homeTeam: 'Portugal', awayTeam: 'Denmark', homeScore: null, awayScore: null, group: 'F', round: 'group_stage', date: '2026-06-29', timeUTC: '18:00', status: 'upcoming', venue: 'Estadio da Luz' },
  { id: 'm12', homeTeam: 'Poland', awayTeam: 'Croatia', homeScore: 1, awayScore: 1, group: 'F', round: 'group_stage', date: '2026-06-27', timeUTC: '16:00', status: 'live', venue: 'PGE Arena', minute: 82 },
  // Group G
  { id: 'm13', homeTeam: 'Morocco', awayTeam: 'Senegal', homeScore: 2, awayScore: 0, group: 'G', round: 'group_stage', date: '2026-06-26', timeUTC: '18:00', status: 'completed', venue: 'Stade Mohammed V' },
  { id: 'm14', homeTeam: 'Egypt', awayTeam: 'Nigeria', homeScore: null, awayScore: null, group: 'G', round: 'group_stage', date: '2026-06-29', timeUTC: '20:00', status: 'upcoming', venue: 'Cairo Stadium' },
  // Group H
  { id: 'm15', homeTeam: 'Colombia', awayTeam: 'Ecuador', homeScore: 3, awayScore: 1, group: 'H', round: 'group_stage', date: '2026-06-26', timeUTC: '20:00', status: 'completed', venue: 'El Campin' },
  { id: 'm16', homeTeam: 'Chile', awayTeam: 'Peru', homeScore: null, awayScore: null, group: 'H', round: 'group_stage', date: '2026-06-29', timeUTC: '22:00', status: 'upcoming', venue: 'Monumental' },
  // Round of 32
  { id: 'm17', homeTeam: 'Mexico', awayTeam: 'Chile', homeScore: null, awayScore: null, group: '', round: 'round_of_32', date: '2026-07-03', timeUTC: '18:00', status: 'upcoming', venue: 'SoFi Stadium' },
  { id: 'm18', homeTeam: 'France', awayTeam: 'Poland', homeScore: null, awayScore: null, group: '', round: 'round_of_32', date: '2026-07-03', timeUTC: '20:00', status: 'upcoming', venue: 'Hard Rock Stadium' },
  // Round of 16
  { id: 'm19', homeTeam: 'Brazil', awayTeam: 'England', homeScore: null, awayScore: null, group: '', round: 'round_of_16', date: '2026-07-06', timeUTC: '18:00', status: 'upcoming', venue: 'MetLife Stadium' },
  { id: 'm20', homeTeam: 'Argentina', awayTeam: 'Germany', homeScore: null, awayScore: null, group: '', round: 'round_of_16', date: '2026-07-06', timeUTC: '22:00', status: 'upcoming', venue: 'Lumen Field' },
  // Quarter Finals
  { id: 'm21', homeTeam: 'France', awayTeam: 'Brazil', homeScore: null, awayScore: null, group: '', round: 'quarter_finals', date: '2026-07-10', timeUTC: '18:00', status: 'upcoming', venue: 'SoFi Stadium' },
  { id: 'm22', homeTeam: 'England', awayTeam: 'Argentina', homeScore: null, awayScore: null, group: '', round: 'quarter_finals', date: '2026-07-10', timeUTC: '22:00', status: 'upcoming', venue: 'MetLife Stadium' },
  // Semi Finals
  { id: 'm23', homeTeam: 'TBD', awayTeam: 'TBD', homeScore: null, awayScore: null, group: '', round: 'semi_finals', date: '2026-07-14', timeUTC: '20:00', status: 'upcoming', venue: 'AT&T Stadium' },
  { id: 'm24', homeTeam: 'TBD', awayTeam: 'TBD', homeScore: null, awayScore: null, group: '', round: 'semi_finals', date: '2026-07-15', timeUTC: '20:00', status: 'upcoming', venue: 'SoFi Stadium' },
  // Final
  { id: 'm25', homeTeam: 'TBD', awayTeam: 'TBD', homeScore: null, awayScore: null, group: '', round: 'final', date: '2026-07-19', timeUTC: '20:00', status: 'upcoming', venue: 'MetLife Stadium' },
];

const GROUP_STANDINGS: Record<string, GroupStanding[]> = {
  'A': [
    { team: 'Mexico', played: 2, won: 1, drawn: 1, lost: 0, gf: 4, ga: 2, points: 4 },
    { team: 'USA', played: 2, won: 1, drawn: 0, lost: 1, gf: 3, ga: 3, points: 3 },
    { team: 'Canada', played: 2, won: 0, drawn: 2, lost: 0, gf: 2, ga: 2, points: 2 },
    { team: 'Costa Rica', played: 2, won: 0, drawn: 1, lost: 1, gf: 1, ga: 3, points: 1 },
  ],
  'B': [
    { team: 'Uruguay', played: 1, won: 1, drawn: 0, lost: 0, gf: 3, ga: 0, points: 3 },
    { team: 'Brazil', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Argentina', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Paraguay', played: 1, won: 0, drawn: 0, lost: 1, gf: 0, ga: 3, points: 0 },
  ],
  'C': [
    { team: 'Spain', played: 1, won: 0, drawn: 1, lost: 0, gf: 2, ga: 2, points: 1 },
    { team: 'Italy', played: 1, won: 0, drawn: 1, lost: 0, gf: 2, ga: 2, points: 1 },
    { team: 'France', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Germany', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  'D': [
    { team: 'Belgium', played: 1, won: 1, drawn: 0, lost: 0, gf: 1, ga: 0, points: 3 },
    { team: 'England', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Netherlands', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Switzerland', played: 1, won: 0, drawn: 0, lost: 1, gf: 0, ga: 1, points: 0 },
  ],
  'E': [
    { team: 'Saudi Arabia', played: 1, won: 1, drawn: 0, lost: 0, gf: 2, ga: 0, points: 3 },
    { team: 'Japan', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'South Korea', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Australia', played: 1, won: 0, drawn: 0, lost: 1, gf: 0, ga: 2, points: 0 },
  ],
  'F': [
    { team: 'Poland', played: 1, won: 0, drawn: 1, lost: 0, gf: 1, ga: 1, points: 1 },
    { team: 'Croatia', played: 1, won: 0, drawn: 1, lost: 0, gf: 1, ga: 1, points: 1 },
    { team: 'Portugal', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Denmark', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  'G': [
    { team: 'Morocco', played: 1, won: 1, drawn: 0, lost: 0, gf: 2, ga: 0, points: 3 },
    { team: 'Egypt', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Nigeria', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Senegal', played: 1, won: 0, drawn: 0, lost: 1, gf: 0, ga: 2, points: 0 },
  ],
  'H': [
    { team: 'Colombia', played: 1, won: 1, drawn: 0, lost: 0, gf: 3, ga: 1, points: 3 },
    { team: 'Chile', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Ecuador', played: 1, won: 0, drawn: 0, lost: 1, gf: 1, ga: 3, points: 0 },
    { team: 'Peru', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  'I': [
    { team: 'Cameroon', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Ghana', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Tunisia', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Ivory Coast', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  'J': [
    { team: 'Iran', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Uzbekistan', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Qatar', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Jordan', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  'K': [
    { team: 'Norway', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Sweden', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Finland', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Wales', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  'L': [
    { team: 'Türkiye', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Czechia', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Austria', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Romania', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  'M': [
    { team: 'Hungary', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Ukraine', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Greece', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Scotland', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  'N': [
    { team: 'Serbia', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Iceland', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Curaçao', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Haiti', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  'O': [
    { team: 'Cape Verde', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'New Zealand', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Bosnia-Herz', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Congo DR', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
  'P': [
    { team: 'Iraq', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'South Africa', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Algeria', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
    { team: 'Pennsylvania', played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ],
};

const TOP_SCORERS: TopScorer[] = [
  { name: 'Vinícius Jr.', team: 'Brazil', goals: 5, assists: 2 },
  { name: 'Kylian Mbappé', team: 'France', goals: 4, assists: 3 },
  { name: 'Erling Haaland', team: 'Norway', goals: 4, assists: 1 },
  { name: 'Julián Álvarez', team: 'Argentina', goals: 3, assists: 2 },
  { name: 'Harry Kane', team: 'England', goals: 3, assists: 1 },
  { name: 'Lamine Yamal', team: 'Spain', goals: 3, assists: 2 },
  { name: 'Mohamed Salah', team: 'Egypt', goals: 2, assists: 3 },
  { name: 'Cristiano Ronaldo', team: 'Portugal', goals: 2, assists: 1 },
  { name: 'Bukayo Saka', team: 'England', goals: 2, assists: 2 },
  { name: 'Florian Wirtz', team: 'Germany', goals: 2, assists: 1 },
];

const FIFA_RANKINGS = [
  { rank: 1, team: 'Argentina', points: 1901 },
  { rank: 2, team: 'France', points: 1854 },
  { rank: 3, team: 'Belgium', points: 1836 },
  { rank: 4, team: 'Brazil', points: 1818 },
  { rank: 5, team: 'England', points: 1795 },
  { rank: 6, team: 'Netherlands', points: 1771 },
  { rank: 7, team: 'Portugal', points: 1761 },
  { rank: 8, team: 'Spain', points: 1749 },
  { rank: 9, team: 'Italy', points: 1726 },
  { rank: 10, team: 'Croatia', points: 1714 },
  { rank: 11, team: 'Germany', points: 1698 },
  { rank: 12, team: 'Morocco', points: 1682 },
  { rank: 13, team: 'Uruguay', points: 1661 },
  { rank: 14, team: 'USA', points: 1648 },
  { rank: 15, team: 'Colombia', points: 1631 },
  { rank: 16, team: 'Mexico', points: 1619 },
  { rank: 17, team: 'Switzerland', points: 1605 },
  { rank: 18, team: 'Denmark', points: 1588 },
  { rank: 19, team: 'Japan', points: 1572 },
  { rank: 20, team: 'Senegal', points: 1556 },
];

// ─── Timezone Helpers ────────────────────────────────────────────────────────

function convertTime(dateStr: string, timeUTC: string, tz: 'IST' | 'ET' | 'CT' | 'PT'): string {
  const [h, m] = timeUTC.split(':').map(Number);
  const offsets: Record<string, number> = { IST: 5.5, ET: -4, CT: -5, PT: -7 };
  let totalMin = h * 60 + m + offsets[tz] * 60;
  if (totalMin < 0) totalMin += 1440;
  if (totalMin >= 1440) totalMin -= 1440;
  const hr = Math.floor(totalMin / 60);
  const min = Math.round(totalMin % 60);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const hr12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
  return `${hr12}:${min.toString().padStart(2, '0')} ${ampm} ${tz}`;
}

function formatMatchTime(dateStr: string, timeUTC: string): string {
  const ist = convertTime(dateStr, timeUTC, 'IST');
  const et = convertTime(dateStr, timeUTC, 'ET');
  const ct = convertTime(dateStr, timeUTC, 'CT');
  const pt = convertTime(dateStr, timeUTC, 'PT');
  return `${ist} · ${et} · ${ct} · ${pt}`;
}

function formatMatchTimeShort(dateStr: string, timeUTC: string): { ist: string; et: string; ct: string; pt: string } {
  return {
    ist: convertTime(dateStr, timeUTC, 'IST'),
    et: convertTime(dateStr, timeUTC, 'ET'),
    ct: convertTime(dateStr, timeUTC, 'CT'),
    pt: convertTime(dateStr, timeUTC, 'PT'),
  };
}

// ─── Countdown Hook ──────────────────────────────────────────────────────────

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, targetDate.getTime() - now.getTime());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

// ─── Shimmer Component ───────────────────────────────────────────────────────

function Shimmer({ className = '' }: { className?: string }) {
  return <div className={`animate-shimmer rounded ${className}`} />;
}

// ─── Pulse Indicator ─────────────────────────────────────────────────────────

function LivePulse() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
      </span>
      <span className="text-red-500 font-bold text-xs uppercase tracking-wider">Live</span>
    </span>
  );
}

// ─── Tab Icons ───────────────────────────────────────────────────────────────

const TAB_ICONS: Record<string, string> = {
  Home: '🏠',
  Standings: '📊',
  Schedule: '📅',
  Leaderboard: '🏆',
  Chat: '💬',
};

// ─── Home Tab ────────────────────────────────────────────────────────────────

function HomeTab() {
  const nextMatch = MOCK_MATCHES.find(m => m.status === 'upcoming');
  const targetDate = nextMatch ? new Date(`${nextMatch.date}T${nextMatch.timeUTC}Z`) : new Date('2026-06-28T18:00:00Z');
  const countdown = useCountdown(targetDate);

  const liveMatches = MOCK_MATCHES.filter(m => m.status === 'live');
  const todayMatches = MOCK_MATCHES.filter(m => m.date === '2026-06-27');
  const groups = Object.keys(TEAMS_BY_GROUP).sort();

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
          ⚽ FIFA 2026 World Cup
        </h1>
        <p className="text-zinc-400 text-sm">USA · Mexico · Canada | June 11 – July 19, 2026</p>
      </div>

      {/* Countdown */}
      {nextMatch && (
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wider">Next Match</h3>
            <span className="text-zinc-500 text-xs">{formatMatchTime(nextMatch.date, nextMatch.timeUTC)}</span>
          </div>
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <div className="text-center">
              <div className="text-3xl mb-1">{getTeamFlag(nextMatch.homeTeam)}</div>
              <div className="text-sm font-medium">{nextMatch.homeTeam}</div>
            </div>
            <div className="text-zinc-500 font-bold text-lg">vs</div>
            <div className="text-center">
              <div className="text-3xl mb-1">{getTeamFlag(nextMatch.awayTeam)}</div>
              <div className="text-sm font-medium">{nextMatch.awayTeam}</div>
            </div>
          </div>
          <div className="flex justify-center gap-3">
            {[
              { val: countdown.days, label: 'Days' },
              { val: countdown.hours, label: 'Hrs' },
              { val: countdown.mins, label: 'Min' },
              { val: countdown.secs, label: 'Sec' },
            ].map(({ val, label }) => (
              <div key={label} className="bg-zinc-900/80 rounded-lg px-3 py-2 text-center min-w-[52px]">
                <div className="text-amber-400 font-mono font-bold text-xl">{val.toString().padStart(2, '0')}</div>
                <div className="text-zinc-500 text-[10px] uppercase">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wider px-1">🔴 Live Now</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {liveMatches.map(m => (
              <div key={m.id} className="bg-zinc-800/50 border border-red-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <LivePulse />
                  <span className="text-zinc-500 text-xs">Group {m.group} · {m.minute}&apos;</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getTeamFlag(m.homeTeam)}</span>
                    <span className="font-medium text-sm">{m.homeTeam}</span>
                  </div>
                  <span className="text-amber-400 font-bold text-lg">{m.homeScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getTeamFlag(m.awayTeam)}</span>
                    <span className="font-medium text-sm">{m.awayTeam}</span>
                  </div>
                  <span className="text-amber-400 font-bold text-lg">{m.awayScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Group Leaders */}
      <div className="space-y-2">
        <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wider px-1">Group Leaders</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {groups.slice(0, 8).map(g => {
            const standings = GROUP_STANDINGS[g] || [];
            const leader = standings[0];
            return (
              <div key={g} className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
                <div className="text-zinc-500 text-[10px] uppercase font-bold">Group {g}</div>
                {leader && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg">{getTeamFlag(leader.team)}</span>
                    <div>
                      <div className="font-medium text-sm">{leader.team}</div>
                      <div className="text-amber-400 text-xs font-bold">{leader.points} pts</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Today&apos;s Matches */}
      <div className="space-y-2">
        <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wider px-1">Today&apos;s Matches — June 27</h3>
        <div className="space-y-2">
          {todayMatches.map(m => (
            <div key={m.id} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getTeamFlag(m.homeTeam)}</span>
                <span className="font-medium text-sm">{m.homeTeam}</span>
                {m.status === 'live' ? (
                  <span className="text-amber-400 font-bold">{m.homeScore} - {m.awayScore}</span>
                ) : m.status === 'completed' ? (
                  <span className="text-zinc-300 font-bold">{m.homeScore} - {m.awayScore}</span>
                ) : null}
                <span className="font-medium text-sm">{m.awayTeam}</span>
                <span className="text-lg">{getTeamFlag(m.awayTeam)}</span>
              </div>
              <div className="flex items-center gap-2">
                {m.status === 'live' ? <LivePulse /> : (
                  <span className="text-zinc-500 text-xs">
                    {formatMatchTimeShort(m.date, m.timeUTC).ist}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Standings Tab ───────────────────────────────────────────────────────────

function StandingsTab() {
  const [selectedGroup, setSelectedGroup] = useState<string>('A');
  const groups = Object.keys(GROUP_STANDINGS).sort();

  const liveMatches = MOCK_MATCHES.filter(m => m.status === 'live');
  const upcomingMatches = MOCK_MATCHES.filter(m => m.status === 'upcoming').slice(0, 6);
  const standings = GROUP_STANDINGS[selectedGroup] || [];

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Live Matches Banner */}
      {liveMatches.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-red-500 font-bold text-sm uppercase tracking-wider px-1 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            Live Matches
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {liveMatches.map(m => (
              <div key={m.id} className="bg-zinc-800/50 border border-red-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <LivePulse />
                  <span className="text-zinc-500 text-xs">Group {m.group} · {m.minute}&apos;</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getTeamFlag(m.homeTeam)}</span>
                    <span className="font-medium">{m.homeTeam}</span>
                  </div>
                  <span className="text-amber-400 font-bold text-xl">{m.homeScore}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getTeamFlag(m.awayTeam)}</span>
                    <span className="font-medium">{m.awayTeam}</span>
                  </div>
                  <span className="text-amber-400 font-bold text-xl">{m.awayScore}</span>
                </div>
                <div className="text-zinc-500 text-xs text-center">{m.venue}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Group Selector */}
      <div className="space-y-2">
        <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wider px-1">Group Standings</h3>
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {groups.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
                selectedGroup === g
                  ? 'bg-amber-400 text-zinc-900'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Standings Table */}
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700/50">
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium text-xs">#</th>
                  <th className="text-left px-2 py-3 text-zinc-400 font-medium text-xs">Team</th>
                  <th className="text-center px-2 py-3 text-zinc-400 font-medium text-xs">P</th>
                  <th className="text-center px-2 py-3 text-zinc-400 font-medium text-xs">W</th>
                  <th className="text-center px-2 py-3 text-zinc-400 font-medium text-xs">D</th>
                  <th className="text-center px-2 py-3 text-zinc-400 font-medium text-xs">L</th>
                  <th className="text-center px-2 py-3 text-zinc-400 font-medium text-xs">GF</th>
                  <th className="text-center px-2 py-3 text-zinc-400 font-medium text-xs">GA</th>
                  <th className="text-center px-2 py-3 text-zinc-400 font-medium text-xs">GD</th>
                  <th className="text-center px-3 py-3 text-amber-400 font-bold text-xs">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => (
                  <tr
                    key={s.team}
                    className={`border-b border-zinc-700/30 ${i < 2 ? 'bg-amber-400/5' : ''}`}
                  >
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                        i < 2 ? 'bg-amber-400/20 text-amber-400' : 'bg-zinc-700/50 text-zinc-400'
                      }`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2">
                        <span>{getTeamFlag(s.team)}</span>
                        <span className="font-medium whitespace-nowrap">{s.team}</span>
                      </div>
                    </td>
                    <td className="text-center px-2 py-2.5 text-zinc-300">{s.played}</td>
                    <td className="text-center px-2 py-2.5 text-zinc-300">{s.won}</td>
                    <td className="text-center px-2 py-2.5 text-zinc-300">{s.drawn}</td>
                    <td className="text-center px-2 py-2.5 text-zinc-300">{s.lost}</td>
                    <td className="text-center px-2 py-2.5 text-zinc-300">{s.gf}</td>
                    <td className="text-center px-2 py-2.5 text-zinc-300">{s.ga}</td>
                    <td className="text-center px-2 py-2.5 text-zinc-300">{s.gf - s.ga > 0 ? '+' : ''}{s.gf - s.ga}</td>
                    <td className="text-center px-3 py-2.5 text-amber-400 font-bold">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upcoming Matches */}
      <div className="space-y-2">
        <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wider px-1">Upcoming Matches</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {upcomingMatches.map(m => {
            const times = formatMatchTimeShort(m.date, m.timeUTC);
            return (
              <div key={m.id} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  {m.group && <span className="text-zinc-500 text-[10px] font-bold uppercase">Group {m.group}</span>}
                  <span className="text-zinc-500 text-[10px]">{m.date}</span>
                </div>
                <div className="flex items-center justify-around">
                  <div className="text-center">
                    <div className="text-2xl">{getTeamFlag(m.homeTeam)}</div>
                    <div className="text-xs font-medium mt-1">{m.homeTeam}</div>
                  </div>
                  <div className="text-zinc-500 font-bold text-sm">vs</div>
                  <div className="text-center">
                    <div className="text-2xl">{getTeamFlag(m.awayTeam)}</div>
                    <div className="text-xs font-medium mt-1">{m.awayTeam}</div>
                  </div>
                </div>
                <div className="text-[10px] text-zinc-500 text-center">
                  {times.ist} · {times.et} · {times.ct} · {times.pt}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Schedule Tab ────────────────────────────────────────────────────────────

function ScheduleTab() {
  const [selectedRound, setSelectedRound] = useState<string>('group_stage');
  const rounds = [...new Set(MOCK_MATCHES.map(m => m.round))];
  const roundLabels: Record<string, string> = {
    'group_stage': 'Group Stage',
    'round_of_32': 'Round of 32',
    'round_of_16': 'Round of 16',
    'quarter_finals': 'Quarter Finals',
    'semi_finals': 'Semi Finals',
    'final': 'Grand Final',
  };
  const roundMatches = MOCK_MATCHES.filter(m => m.round === selectedRound);

  // Group matches by date
  const matchesByDate = roundMatches.reduce<Record<string, Match[]>>((acc, m) => {
    if (!acc[m.date]) acc[m.date] = [];
    acc[m.date].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Round Selector */}
      <div className="space-y-2">
        <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wider px-1">Schedule by Round</h3>
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {rounds.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRound(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
                selectedRound === r
                  ? 'bg-amber-400 text-zinc-900'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
              }`}
            >
              {roundLabels[r] || r}
            </button>
          ))}
        </div>
      </div>

      {/* Matches */}
      {Object.entries(matchesByDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, matches]) => (
        <div key={date} className="space-y-3">
          <div className="flex items-center gap-3 px-1">
            <h4 className="text-zinc-300 font-bold text-sm">
              {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h4>
            <div className="flex-1 h-px bg-zinc-700/50" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {matches.map(m => {
              const times = formatMatchTimeShort(m.date, m.timeUTC);
              return (
                <div
                  key={m.id}
                  className={`bg-zinc-800/50 border rounded-xl p-4 space-y-3 ${
                    m.status === 'live' ? 'border-red-500/30' : m.status === 'completed' ? 'border-zinc-700/30' : 'border-zinc-700/50'
                  }`}
                >
                  {/* Status badge */}
                  <div className="flex items-center justify-between">
                    {m.status === 'live' ? (
                      <LivePulse />
                    ) : m.status === 'completed' ? (
                      <span className="text-zinc-500 text-xs font-bold uppercase">FT</span>
                    ) : (
                      <span className="text-green-500/80 text-xs font-bold uppercase">Upcoming</span>
                    )}
                    {m.group && <span className="text-zinc-500 text-[10px] font-bold">Group {m.group}</span>}
                  </div>

                  {/* Teams & Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getTeamFlag(m.homeTeam)}</span>
                        <span className="font-medium">{m.homeTeam}</span>
                      </div>
                      <span className={`font-bold text-lg ${m.status === 'live' ? 'text-amber-400' : 'text-zinc-300'}`}>
                        {m.homeScore ?? '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getTeamFlag(m.awayTeam)}</span>
                        <span className="font-medium">{m.awayTeam}</span>
                      </div>
                      <span className={`font-bold text-lg ${m.status === 'live' ? 'text-amber-400' : 'text-zinc-300'}`}>
                        {m.awayScore ?? '-'}
                      </span>
                    </div>
                  </div>

                  {/* Time & Venue */}
                  <div className="space-y-1 pt-1 border-t border-zinc-700/30">
                    <div className="text-[10px] text-zinc-500 flex flex-wrap gap-x-2">
                      <span>{times.ist}</span>
                      <span>·</span>
                      <span>{times.et}</span>
                      <span>·</span>
                      <span>{times.ct}</span>
                      <span>·</span>
                      <span>{times.pt}</span>
                    </div>
                    <div className="text-[10px] text-zinc-600">🏟 {m.venue}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* All Rounds Quick View */}
      <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 space-y-3">
        <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wider">Tournament Progress</h3>
        <div className="space-y-2">
          {rounds.map(r => {
            const total = MOCK_MATCHES.filter(m => m.round === r).length;
            const completed = MOCK_MATCHES.filter(m => m.round === r && m.status === 'completed').length;
            const live = MOCK_MATCHES.filter(m => m.round === r && m.status === 'live').length;
            const pct = total > 0 ? ((completed + live) / total) * 100 : 0;
            return (
              <div key={r} className="flex items-center gap-3">
                <span className="text-zinc-400 text-xs font-medium w-28 flex-shrink-0">{roundLabels[r] || r}</span>
                <div className="flex-1 bg-zinc-700/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-zinc-500 text-[10px] w-12 text-right">{completed}/{total}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Leaderboard Tab ─────────────────────────────────────────────────────────

function LeaderboardTab() {
  const maxGoals = TOP_SCORERS[0]?.goals || 1;
  const maxRankPoints = FIFA_RANKINGS[0]?.points || 1;

  return (
    <div className="space-y-6 animate-slide-in">
      {/* FIFA Rankings */}
      <div className="space-y-2">
        <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wider px-1">FIFA World Rankings</h3>
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 space-y-2">
          {FIFA_RANKINGS.map(r => (
            <div key={r.rank} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                r.rank <= 3 ? 'bg-amber-400/20 text-amber-400' : 'bg-zinc-700/50 text-zinc-400'
              }`}>
                {r.rank}
              </span>
              <span className="text-lg flex-shrink-0">{getTeamFlag(r.team)}</span>
              <span className="font-medium text-sm w-24 flex-shrink-0 truncate">{r.team}</span>
              <div className="flex-1 bg-zinc-700/50 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-700"
                  style={{ width: `${(r.points / maxRankPoints) * 100}%` }}
                />
              </div>
              <span className="text-zinc-300 text-xs font-mono w-10 text-right flex-shrink-0">{r.points}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Scorers */}
      <div className="space-y-2">
        <h3 className="text-amber-400 font-bold text-sm uppercase tracking-wider px-1">Top Scorers</h3>
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl overflow-hidden">
          <div className="p-4 space-y-3">
            {TOP_SCORERS.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                  i < 3 ? 'bg-amber-400/20 text-amber-400' : 'bg-zinc-700/50 text-zinc-400'
                }`}>
                  {i + 1}
                </span>
                <span className="text-lg flex-shrink-0">{getTeamFlag(s.team)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{s.name}</div>
                  <div className="text-zinc-500 text-[10px]">{s.team}</div>
                </div>
                <div className="flex-1 bg-zinc-700/50 rounded-full h-3 overflow-hidden max-w-32">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-700"
                    style={{ width: `${(s.goals / maxGoals) * 100}%` }}
                  />
                </div>
                <div className="text-right flex-shrink-0 w-14">
                  <div className="text-amber-400 font-bold text-sm">{s.goals} ⚽</div>
                  <div className="text-zinc-500 text-[10px]">{s.assists} Ast</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Golden Boot Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Goals', value: TOP_SCORERS.reduce((a, s) => a + s.goals, 0), icon: '⚽' },
          { label: 'Total Assists', value: TOP_SCORERS.reduce((a, s) => a + s.assists, 0), icon: '🅰️' },
          { label: 'Leading Scorer', value: TOP_SCORERS[0]?.goals || 0, icon: '🥇' },
          { label: 'Teams Scored', value: new Set(TOP_SCORERS.map(s => s.team)).size, icon: '🌍' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-amber-400 font-bold text-xl">{value}</div>
            <div className="text-zinc-500 text-[10px] uppercase font-medium">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Chat Tab ────────────────────────────────────────────────────────────────

function ChatTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: '👋 Welcome to FIFA 2026 Chatbot! Ask me about standings, live scores, schedules, top scorers, or any World Cup info.' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function generateResponse(query: string): string {
    const q = query.toLowerCase();

    // Standings queries
    if (q.includes('standing') || q.includes('group') || q.includes('table') || q.includes('points')) {
      const groupMatch = q.match(/group\s*([a-p])/i);
      if (groupMatch) {
        const g = groupMatch[1].toUpperCase();
        const standings = GROUP_STANDINGS[g];
        if (standings) {
          return `📊 Group ${g} Standings:\n\n${standings.map((s, i) =>
            `${i + 1}. ${getTeamFlag(s.team)} ${s.team} — ${s.points} pts (W${s.won} D${s.drawn} L${s.lost})`
          ).join('\n')}`;
        }
        return `Group ${g} not found. Available groups: A-P.`;
      }
      // Show all group leaders
      const leaders = Object.entries(GROUP_STANDINGS)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([g, standings]) => `${g}: ${getTeamFlag(standings[0].team)} ${standings[0].team} (${standings[0].points} pts)`)
        .join('\n');
      return `📊 Group Leaders:\n\n${leaders}\n\nAsk about a specific group like "Group A standings" for details.`;
    }

    // Live queries
    if (q.includes('live') || q.includes('score') || q.includes('now')) {
      const live = MOCK_MATCHES.filter(m => m.status === 'live');
      if (live.length === 0) return 'No matches are currently live. Check the schedule for upcoming matches!';
      return `🔴 Live Now:\n\n${live.map(m =>
        `${getTeamFlag(m.homeTeam)} ${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam} ${getTeamFlag(m.awayTeam)} (${m.minute}' | Group ${m.group})`
      ).join('\n')}`;
    }

    // Schedule queries
    if (q.includes('schedule') || q.includes('when') || q.includes('upcoming') || q.includes('next') || q.includes('match')) {
      const upcoming = MOCK_MATCHES.filter(m => m.status === 'upcoming').slice(0, 5);
      return `📅 Upcoming Matches:\n\n${upcoming.map(m => {
        const times = formatMatchTimeShort(m.date, m.timeUTC);
        return `${getTeamFlag(m.homeTeam)} ${m.homeTeam} vs ${m.awayTeam} ${getTeamFlag(m.awayTeam)}\n${m.date} · ${times.ist}`;
      }).join('\n\n')}`;
    }

    // Scorer queries
    if (q.includes('scorer') || q.includes('goal') || q.includes('top score') || q.includes('golden boot')) {
      return `⚽ Top Scorers:\n\n${TOP_SCORERS.slice(0, 5).map((s, i) =>
        `${i + 1}. ${s.name} ${getTeamFlag(s.team)} — ${s.goals} goals, ${s.assists} assists`
      ).join('\n')}`;
    }

    // Ranking queries
    if (q.includes('rank') || q.includes('fifa')) {
      return `🏆 FIFA Rankings (Top 10):\n\n${FIFA_RANKINGS.slice(0, 10).map(r =>
        `${r.rank}. ${getTeamFlag(r.team)} ${r.team} — ${r.points} pts`
      ).join('\n')}`;
    }

    // Team-specific query
    const teamNames = Object.keys(TEAM_FLAGS);
    const matchedTeam = teamNames.find(t => q.includes(t.toLowerCase()));
    if (matchedTeam) {
      // Find which group
      const group = Object.entries(TEAMS_BY_GROUP).find(([, teams]) => teams.includes(matchedTeam));
      // Find ranking
      const ranking = FIFA_RANKINGS.find(r => r.team === matchedTeam);
      // Find scorer
      const scorer = TOP_SCORERS.find(s => s.team === matchedTeam);
      let resp = `${getTeamFlag(matchedTeam)} **${matchedTeam}**\n\n`;
      if (group) resp += `📍 Group ${group[0]}\n`;
      if (ranking) resp += `🏆 FIFA Rank: #${ranking.rank} (${ranking.points} pts)\n`;
      if (scorer) resp += `⚽ Top Scorer: ${scorer.name} (${scorer.goals} goals)\n`;
      const teamMatches = MOCK_MATCHES.filter(m => m.homeTeam === matchedTeam || m.awayTeam === matchedTeam);
      if (teamMatches.length > 0) {
        resp += `\n📋 Matches:\n`;
        resp += teamMatches.map(m => {
          const opp = m.homeTeam === matchedTeam ? m.awayTeam : m.homeTeam;
          const status = m.status === 'live' ? `LIVE ${m.homeScore}-${m.awayScore}` : m.status === 'completed' ? `FT ${m.homeScore}-${m.awayScore}` : `${m.date}`;
          return `vs ${getTeamFlag(opp)} ${opp} — ${status}`;
        }).join('\n');
      }
      return resp;
    }

    // Venue queries
    if (q.includes('venue') || q.includes('stadium')) {
      const venues = [...new Set(MOCK_MATCHES.map(m => m.venue))].sort();
      return `🏟️ Venues:\n\n${venues.join('\n')}`;
    }

    // Help
    if (q.includes('help') || q.includes('what can')) {
      return `I can help with:\n• "standings" or "Group A" — group tables\n• "live" — current live scores\n• "schedule" — upcoming matches\n• "scorers" — top goal scorers\n• "rankings" — FIFA world rankings\n• Any team name (e.g. "Brazil") — team info\n• "venues" — stadium list`;
    }

    // Default
    return `I'm not sure about that. Try asking about:\n• Standings (e.g. "Group A standings")\n• Live scores\n• Schedule/upcoming matches\n• Top scorers\n• FIFA rankings\n• A specific team name\n\nType "help" for more options!`;
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = generateResponse(trimmed);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-slide-in">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-1 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-amber-400/20 text-zinc-100 rounded-br-md'
                : 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-200 rounded-bl-md'
            }`}>
              {msg.text.split('\n').map((line, j) => (
                <span key={j}>
                  {line}
                  {j < msg.text.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="sticky bottom-0 bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-700/50 pt-3 pb-1">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask about standings, live scores, schedule..."
            className="flex-1 bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-900 font-bold rounded-xl px-4 py-2.5 text-sm transition-all flex-shrink-0"
          >
            Send
          </button>
        </div>
        <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
          {['Live scores', 'Group A', 'Top scorers', 'Schedule', 'Rankings', 'Help'].map(hint => (
            <button
              key={hint}
              onClick={() => { setInput(hint); }}
              className="px-2.5 py-1 rounded-lg bg-zinc-800/50 text-zinc-400 text-[10px] hover:bg-zinc-700/50 hover:text-zinc-200 transition-all flex-shrink-0 border border-zinc-700/30"
            >
              {hint}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FIFA2026Page() {
  const [activeTab, setActiveTab] = useState<string>('Home');
  const [isLoading, setIsLoading] = useState(true);
  const tabs = ['Home', 'Standings', 'Schedule', 'Leaderboard', 'Chat'];

  useEffect(() => {
    // Simulate initial data load
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Shimmer loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <Shimmer className="h-10 w-64 mx-auto" />
          <Shimmer className="h-4 w-48 mx-auto" />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[...Array(5)].map((_, i) => <Shimmer key={i} className="h-10 w-full" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => <Shimmer key={i} className="h-40 w-full" />)}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Shimmer key={i} className="h-16 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
        {/* Tab Navigation */}
        <div className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-md -mx-4 md:-mx-6 px-4 md:px-6 py-3 mb-4 border-b border-zinc-800/50">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all flex-shrink-0 ${
                  activeTab === tab
                    ? 'bg-amber-400 text-zinc-900 shadow-lg shadow-amber-400/20'
                    : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
                }`}
              >
                <span className="text-base">{TAB_ICONS[tab]}</span>
                <span className="hidden sm:inline">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'Home' && <HomeTab />}
        {activeTab === 'Standings' && <StandingsTab />}
        {activeTab === 'Schedule' && <ScheduleTab />}
        {activeTab === 'Leaderboard' && <LeaderboardTab />}
        {activeTab === 'Chat' && <ChatTab />}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-sm border-t border-zinc-800/50 py-2 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-zinc-600 text-[10px]">FIFA 2026 World Cup Tracker</span>
          <div className="flex items-center gap-1">
            {MOCK_MATCHES.filter(m => m.status === 'live').length > 0 && (
              <>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                </span>
                <span className="text-red-500 text-[10px] font-bold">
                  {MOCK_MATCHES.filter(m => m.status === 'live').length} LIVE
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
