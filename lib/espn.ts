// ESPN API scraper — runs server-side on Vercel
// Fetches live FIFA 2026 World Cup data with in-memory cache + JSON fallback

import * as fs from 'fs';
import * as path from 'path';

const ESPN_STANDINGS = 'https://site.api.espn.com/apis/v3/sports/soccer/fifa.world/standings';
const ESPN_SCHEDULE = 'https://site.api.espn.com/apis/v3/sports/soccer/fifa.world/schedule?week=1';
const ESPN_STATS = 'https://site.api.espn.com/apis/v3/sports/soccer/fifa.world/teams/8022/statistics';

// In-memory cache (resets on cold start, but each instance caches for 5 min)
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Load fallback data lazily (only when needed)
let fallbackData: Record<string, any> | null = null;

function loadFallback(): Record<string, any> {
  if (fallbackData) return fallbackData;
  try {
    const dir = path.join(process.cwd(), 'lib', 'fallback');
    fallbackData = {
      standings: JSON.parse(fs.readFileSync(path.join(dir, 'standings.json'), 'utf-8')),
      schedule: JSON.parse(fs.readFileSync(path.join(dir, 'schedule.json'), 'utf-8')),
      scorers: JSON.parse(fs.readFileSync(path.join(dir, 'scorers.json'), 'utf-8')),
    };
  } catch {
    fallbackData = {};
  }
  return fallbackData;
}

function getFallback(key: string): any | null {
  return loadFallback()[key] || null;
}

async function fetchWithCache(key: string, url: string): Promise<any> {
  const now = Date.now();
  if (cache[key] && now - cache[key].timestamp < CACHE_TTL) {
    return cache[key].data;
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FIFA26-Tracker/1.0' },
      cache: 'no-store',
    });
    if (!res.ok) {
      // ESPN API returned error — use fallback immediately
      const fallback = getFallback(key);
      if (fallback) {
        cache[key] = { data: fallback, timestamp: now };
        return fallback;
      }
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    // Validate data has content
    if (!data || (typeof data === 'object' && 'code' in data && (data as any).code === 404)) {
      const fallback = getFallback(key);
      if (fallback) {
        cache[key] = { data: fallback, timestamp: now };
        return fallback;
      }
    }
    cache[key] = { data, timestamp: now };
    return data;
  } catch {
    // Fallback to bundled JSON
    const fallback = getFallback(key);
    if (fallback) {
      cache[key] = { data: fallback, timestamp: now };
      return fallback;
    }
    // In-memory stale cache is better than nothing
    if (cache[key]) return cache[key].data;
    return null;
  }
}

// ─── Standings ───────────────────────────────────────────────
export async function getStandings() {
  const raw = await fetchWithCache('standings', ESPN_STANDINGS);
  if (!raw) return null;

  try {
    // If raw is already an array (our pre-formatted fallback), return directly
    if (Array.isArray(raw)) return raw;

    // Parse ESPN API format
    const groups: any[] = [];
    const children = raw.children || [raw];
    for (const child of children) {
      const standingsEntry = child.standings?.entries || [];
      if (standingsEntry.length === 0) continue;
      const groupName = child.name || 'Group';
      const table = standingsEntry.map((team: any) => ({
        name: team.team?.displayName || team.team?.name || 'TBD',
        short: team.team?.abbreviation || '??',
        logo: team.team?.logo?.[0]?.href || '',
        played: team.stats?.find((s: any) => s.name === 'gamesPlayed')?.value || 0,
        wins: team.stats?.find((s: any) => s.name === 'wins')?.value || 0,
        draws: team.stats?.find((s: any) => s.name === 'ties')?.value || 0,
        losses: team.stats?.find((s: any) => s.name === 'losses')?.value || 0,
        goalsFor: team.stats?.find((s: any) => s.name === 'pointsFor')?.value || 0,
        goalsAgainst: team.stats?.find((s: any) => s.name === 'pointsAgainst')?.value || 0,
        goalDiff: team.stats?.find((s: any) => s.name === 'pointDifferential')?.value || 0,
        points: team.stats?.find((s: any) => s.name === 'points')?.value || 0,
      }));
      groups.push({ name: groupName, teams: table });
    }
    return groups.length > 0 ? groups : getFallback('standings');
  } catch {
    return getFallback('standings');
  }
}

// ─── Schedule ────────────────────────────────────────────────
export async function getSchedule() {
  const raw = await fetchWithCache('schedule', ESPN_SCHEDULE);
  if (!raw) return null;

  try {
    // If raw is already an array (our pre-formatted fallback), return directly
    if (Array.isArray(raw)) return raw;

    const events: any[] = raw.events || [];
    const matches = events.map((event: any) => {
      const competition = event.competitions?.[0];
      const homeComp = competition?.competitors?.[0];
      const awayComp = competition?.competitors?.[1];
      const home = homeComp?.team?.displayName || homeComp?.team?.name || 'TBD';
      const away = awayComp?.team?.displayName || awayComp?.team?.name || 'TBD';
      const homeScore = homeComp?.score?.value ?? null;
      const awayScore = awayComp?.score?.value ?? null;
      const status = competition?.status?.type?.name || 'SCHEDULED';
      const date = event.date || '';
      const venue = competition?.venue?.fullName || '';
      
      return {
        id: event.id || '',
        home,
        away,
        homeScore,
        awayScore,
        status,
        date,
        venue,
        homeLogo: homeComp?.team?.logo?.[0]?.href || '',
        awayLogo: awayComp?.team?.logo?.[0]?.href || '',
      };
    });
    return matches;
  } catch {
    return getFallback('schedule');
  }
}

// ─── Scorers (Top Players) ──────────────────────────────────
export async function getScorers() {
  const raw = await fetchWithCache('scorers', ESPN_STATS);
  if (!raw) return null;

  try {
    // If raw is already an array (our pre-formatted fallback), return directly
    if (Array.isArray(raw)) return raw;

    const athletes = raw.athletes || [];
    const scorers = athletes
      .filter((a: any) => a.stats?.goals !== undefined)
      .map((a: any) => ({
        name: a.displayName || a.name || 'Unknown',
        team: a.team?.abbreviation || a.team?.name || '',
        goals: a.stats?.goals || 0,
        assists: a.stats?.assists || 0,
        matches: a.stats?.matchesPlayed || 0,
      }))
      .sort((a: any, b: any) => b.goals - a.goals)
      .slice(0, 20);
    return scorers;
  } catch {
    return getFallback('scorers');
  }
}

// ─── Team Rankings (by points) ───────────────────────────────
export async function getRanking() {
  const groups = await getStandings();
  if (!groups) return null;

  const allTeams: any[] = [];
  for (const group of groups) {
    for (const team of group.teams) {
      allTeams.push({ ...team, group: group.name });
    }
  }
  allTeams.sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff);
  return allTeams.map((t, i) => ({ ...t, rank: i + 1 }));
}

// ─── Chat / Query Handler ────────────────────────────────────
export async function handleChat(query: string): Promise<string> {
  const q = query.toLowerCase().trim();
  
  // Standings queries
  if (q.includes('standing') || q.includes('table') || q.includes('points') || q.includes('group')) {
    const groups = await getStandings();
    if (!groups) return "Sorry, I couldn't fetch the standings right now. Try again in a moment.";
    
    let response = "🏆 **FIFA 2026 World Cup Standings**\n\n";
    for (const group of groups) {
      response += `**${group.name}**\n`;
      response += "Team | Pts | GD\n";
      for (const team of group.teams) {
        const gd = team.goalDiff >= 0 ? `+${team.goalDiff}` : `${team.goalDiff}`;
        response += `${team.short} | ${team.points} | ${gd}\n`;
      }
      response += "\n";
    }
    return response;
  }

  // Schedule / Matches queries
  if (q.includes('match') || q.includes('schedule') || q.includes('today') || q.includes('next') || q.includes('upcoming')) {
    const matches = await getSchedule();
    if (!matches) return "Sorry, I couldn't fetch the schedule right now.";
    
    const now = new Date();
    const upcoming = matches.filter((m: any) => m.status === 'SCHEDULED' || m.status === 'STATUS_SCHEDULED');
    
    if (upcoming.length === 0) return "No upcoming matches scheduled right now.";
    
    let response = "⚽ **Upcoming Matches**\n\n";
    for (const m of upcoming.slice(0, 10)) {
      const date = new Date(m.date);
      const ist = new Date(date.getTime() + 5.5 * 3600000).toISOString().slice(0, 16).replace('T', ' ');
      response += `${m.home} vs ${m.away}\n📅 ${ist} IST\n🏟️ ${m.venue}\n\n`;
    }
    return response;
  }

  // Scorers queries
  if (q.includes('scorer') || q.includes('goal') || q.includes('top') || q.includes('golden boot') || q.includes('messi') || q.includes('ronaldo') || q.includes('mbappe')) {
    const scorers = await getScorers();
    if (!scorers) return "Sorry, I couldn't fetch the scorers right now.";
    
    let response = "🥇 **Top Scorers**\n\n";
    for (const s of scorers.slice(0, 10)) {
      response += `${s.name} (${s.team}) — ${s.goals} goals, ${s.assists} assists\n`;
    }
    return response;
  }

  // Team-specific queries
  const teamNames = [
    'usa', 'united states', 'us', 'mexico', 'canada', 'brazil', 'argentina',
    'france', 'germany', 'england', 'spain', 'portugal', 'italy', 'netherlands',
    'belgium', 'croatia', 'japan', 'south korea', 'australia', 'morocco',
    'senegal', 'ghana', 'cameroon', 'nigeria', 'egypt', 'tunisia',
    'colombia', 'uruguay', 'chile', 'ecuador', 'peru', 'paraguay',
    'iran', 'saudi arabia', 'qatar', 'uae', 'iraq', 'china',
    'new zealand', 'costa rica', 'panama', 'jamaica', 'honduras',
    'serbia', 'poland', 'switzerland', 'denmark', 'norway', 'sweden',
    'ukraine', 'scotland', 'turkey', 'czech', 'austria', 'hungary',
    'nigeria', 'ivory coast', 'algeria', 'mali', 'south africa',
    'cape verde', 'equatorial guinea', 'gabon', 'congo',
  ];
  
  for (const name of teamNames) {
    if (q.includes(name)) {
      const matches = await getSchedule();
      const groups = await getStandings();
      if (!matches) return "Sorry, I couldn't find data right now.";
      
      const teamMatches = matches.filter((m: any) => 
        m.home.toLowerCase().includes(name) || m.away.toLowerCase().includes(name)
      );
      
      let response = `⚽ **${name.charAt(0).toUpperCase() + name.slice(1)}**\n\n`;
      
      // Show standings info
      if (groups) {
        for (const group of groups) {
          const team = group.teams.find((t: any) => t.name.toLowerCase().includes(name));
          if (team) {
            response += `📊 **${group.name}**: ${team.played}P, ${team.wins}W, ${team.draws}D, ${team.losses}L, ${team.points} pts (GD: ${team.goalDiff >= 0 ? '+' : ''}${team.goalDiff})\n\n`;
          }
        }
      }
      
      response += "**Matches:**\n";
      for (const m of teamMatches.slice(0, 5)) {
        const score = m.homeScore !== null ? `${m.homeScore}-${m.awayScore}` : 'vs';
        response += `${m.home} ${score} ${m.away} (${m.status})\n`;
      }
      return response;
    }
  }

  // Default
  return "I can help you with FIFA 2026 World Cup updates! Try asking:\n• \"standings\" — current group tables\n• \"schedule\" or \"today\" — upcoming matches\n• \"scorers\" — top goal scorers\n• \"Messi\" or \"Brazil\" — team-specific info\n• \"next match\" — what's coming up";
}
