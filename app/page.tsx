
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════ */

const API = 'https://fifa2026-tracker.onrender.com';

// Prevent Vercel from caching SSR pages (always fetch fresh)
export const dynamic = 'force-dynamic';

interface Standing { pos:number; team:string; pld:number; w:number; d:number; l:number; gf:number; ga:number; gd:string; pts:number; }
interface Match { match:string; date:string; home:string; away:string; home_score:number|null; away_score:number|null; status:string; venue:string; group:string; round:string; time_utc?:string; time_ist?:string; time_et?:string; time_ct?:string; time_pt?:string; }
interface Scorer { rank:number; player:string; team:string; goals:number; assists:number; }
interface Ranking { rank:number; team:string; points:number; trend:string; }

/* ═══════════════════════════════════════════════════════════════
   DATA FETCHER
   ═══════════════════════════════════════════════════════════════ */

async function fetchJSON<T>(url:string):Promise<T|null> {
  // Try up to 3 times with increasing delay (handles Render cold start)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
      const r = await fetch(url + (url.includes('?') ? '&' : '?') + '_=' + Date.now(), { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeout);
      if (!r.ok) return null;
      return await r.json();
    } catch {
      if (attempt < 2) await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  return null;
}

function useLiveData() {
  const [standings, setStandings] = useState<Record<string,Standing[]>>({});
  const [schedule, setSchedule] = useState<Record<string,Match[]>>({});
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const load = useCallback(async () => {
    const [stData, scData, scorersData, rkData] = await Promise.all([
      fetchJSON<any>(`${API}/api/standings`),
      fetchJSON<Record<string,Match[]>>(`${API}/api/schedule`),
      fetchJSON<Scorer[]>(`${API}/api/scorers`),
      fetchJSON<Ranking[]>(`${API}/api/ranking`),
    ]);

    if (!stData && !scData) { setError(true); setLoading(false); return; }

    if (stData) {
      setStandings(stData.standings || stData.groups || {});
      setLiveMatches(stData.live_matches || []);
      setUpcomingMatches(stData.upcoming_matches || []);
      setLastUpdated(stData.last_updated || '');
    }
    if (scData) setSchedule(scData);
    if (scorersData) setScorers(scorersData);
    if (rkData) setRankings(rkData);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Only fetch on client side (not during SSR)
    if (typeof window === 'undefined') return;
    load();
    // Refresh every 60 seconds
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load]);

  // Auto-retry on error: if error, retry after 5 seconds (up to 5 times)
  const [retryCount, setRetryCount] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (error && retryCount < 5) {
      const t = setTimeout(() => { setRetryCount(c => c + 1); load(); }, 5000);
      return () => clearTimeout(t);
    }
  }, [error, retryCount, load]);

  return { standings, schedule, scorers, rankings, liveMatches, upcomingMatches, loading, error, lastUpdated, reload: load };
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

const TEAM_FLAGS: Record<string, string> = {
  Argentina:'🇦🇷',Brazil:'🇧🇷',France:'🇫🇷',Germany:'🇩🇪',Spain:'🇪🇸',England:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',Italy:'🇮🇹',Netherlands:'🇳🇱',
  Portugal:'🇵🇹',Belgium:'🇧🇪',Croatia:'🇭🇷',Uruguay:'🇺🇾',Colombia:'🇨🇴',USA:'🇺🇸',Mexico:'🇲🇽',Canada:'🇨🇦',
  'Costa Rica':'🇨🇷','Saudi Arabia':'🇸🇦',Japan:'🇯🇵','South Korea':'🇰🇷',Australia:'🇦🇺',Morocco:'🇲🇦',Senegal:'🇸🇳',Egypt:'🇪🇬',
  Nigeria:'🇳🇬',Poland:'🇵🇱',Denmark:'🇩🇰',Switzerland:'🇨🇭',Sweden:'🇸🇪',Norway:'🇳🇴',Türkiye:'🇹🇷',Paraguay:'🇵🇾',
  Chile:'🇨🇱',Peru:'🇵🇪',Ecuador:'🇪🇨',Cameroon:'🇨🇲',Ghana:'🇬🇭',Tunisia:'🇹🇳',Iran:'🇮🇷','Ivory Coast':'🇨🇮',
  Qatar:'🇶🇦',Iraq:'🇮🇶','South Africa':'🇿🇦','Congo DR':'🇨🇩',Uzbekistan:'🇺🇿',Panama:'🇵🇦',TBD:'❓',
  'Cape Verde':'🇨🇻','New Zealand':'🇳🇿',Jamaica:'🇯🇲','Bosnia-Herz':'🇧🇦',Curaçao:'🇨🇼',Haiti:'🇭🇹',Iceland:'🇮🇸',
  Serbia:'🇷🇸',Hungary:'🇭🇺',Austria:'🇦🇹','Czechia':'🇨🇿',Ukraine:'🇺🇦',Greece:'🇬🇷',Wales:'🏴󠁧󠁢󠁷󠁬󠁳󠁿',Scotland:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  Romania:'🇷🇴',Finland:'🇫🇮','Algeria':'🇩🇿',Jordan:'🇯🇴'
};
const flag = (t: string) => TEAM_FLAGS[t] || '⚽';

function fmtDate(d: string) {
  if (!d) return '?';
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function roundLabel(r: string) {
  return { group_stage:'Group Stage', round_of_32:'Round of 32', round_of_16:'Round of 16', quarter_finals:'Quarter Finals', semi_finals:'Semi Finals', final:'Grand Final' }[r] || r;
}

function timeDisplay(m: Match) {
  if (m.time_ist && m.time_et) {
    return `🇮🇳 ${m.time_ist} · 🇺🇸 ${m.time_et}`;
  }
  if (m.time_utc) return `🌍 ${m.time_utc} UTC`;
  return '';
}

/* ═══════════════════════════════════════════════════════════════
   UI COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function LiveDot() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
      </span>
      <span className="text-red-400 font-bold text-[10px] uppercase tracking-widest">Live</span>
    </span>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-[#1a1f2e] border border-[#2a3146] rounded-2xl ${className}`}>{children}</div>;
}

function Countdown({ target }: { target: Date }) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setT({ d: Math.floor(diff / 864e5), h: Math.floor((diff % 864e5) / 36e5), m: Math.floor((diff % 36e5) / 6e4), s: Math.floor((diff % 6e4) / 1e3) });
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [target]);
  return (
    <div className="flex gap-3 justify-center">
      {[{ v: t.d, l: 'DAYS' }, { v: t.h, l: 'HRS' }, { v: t.m, l: 'MIN' }, { v: t.s, l: 'SEC' }].map(({ v, l }) => (
        <div key={l} className="bg-[#0f1219] rounded-xl px-4 py-3 text-center min-w-[60px] border border-[#2a3146]">
          <div className="text-amber-400 font-mono font-black text-2xl">{v.toString().padStart(2, '0')}</div>
          <div className="text-zinc-500 text-[9px] font-bold tracking-widest mt-0.5">{l}</div>
        </div>
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-5xl animate-bounce">⚽</div>
        <div className="text-amber-400 font-bold text-sm animate-pulse">Loading live data...</div>
        <div className="text-zinc-500 text-xs">Connecting to ESPN API</div>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-6">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-4xl">⏳</div>
        <h2 className="text-xl font-bold text-zinc-200">Waking up the server...</h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          The free-tier backend is spinning up. First load takes ~30 seconds.
          <br />I&apos;ll keep retrying automatically.
        </p>
        <div className="flex flex-col gap-2 items-center">
          <button onClick={onRetry} className="bg-amber-400 text-zinc-900 font-bold px-6 py-2.5 rounded-xl hover:bg-amber-300 transition-all">
            Retry Now
          </button>
          <button onClick={onRetry} className="text-zinc-400 text-xs hover:text-zinc-200 transition-all underline">
            Or click here
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════════════════ */

function HomeTab({ liveMatches, upcomingMatches, standings }: { liveMatches: Match[]; upcomingMatches: Match[]; standings: Record<string, Standing[]> }) {
  const next = upcomingMatches.find(m => m.status !== 'Final' && m.status !== 'FT' && m.home_score === null);
  const target = next ? new Date(`${next.date}T${(next.time_utc || '00:00')}:00Z`) : null;
  const groups = Object.keys(standings).sort();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 pt-2">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
          ⚽ FIFA World Cup 2026
        </h1>
        <p className="text-zinc-500 text-sm">USA · Mexico · Canada — June 11 – July 19 · Live from ESPN</p>
      </div>

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-red-400 font-bold text-xs uppercase tracking-widest px-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live Now
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {liveMatches.map(m => (
              <Card key={m.match} className="p-4 space-y-3 border-red-500/20">
                <div className="flex items-center justify-between">
                  <LiveDot />
                  <span className="text-zinc-500 text-[10px]">{m.group}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><span className="text-xl">{flag(m.home)}</span><span className="font-medium text-sm">{m.home}</span></div>
                    <span className="text-amber-400 font-black text-xl">{m.home_score ?? '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><span className="text-xl">{flag(m.away)}</span><span className="font-medium text-sm">{m.away}</span></div>
                    <span className="text-amber-400 font-black text-xl">{m.away_score ?? '-'}</span>
                  </div>
                </div>
                <div className="text-zinc-600 text-[10px] text-center pt-1 border-t border-[#2a3146]">🏟 {m.venue}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Next Match Countdown */}
      {next && target && (
        <Card className="p-6 space-y-4 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">Next Match</span>
            <span className="text-zinc-500 text-[10px]">{timeDisplay(next)}</span>
          </div>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-4xl mb-1">{flag(next.home)}</div>
              <div className="font-semibold text-sm">{next.home}</div>
            </div>
            <div className="text-zinc-600 font-black text-xl">VS</div>
            <div className="text-center">
              <div className="text-4xl mb-1">{flag(next.away)}</div>
              <div className="font-semibold text-sm">{next.away}</div>
            </div>
          </div>
          <Countdown target={target} />
          <div className="text-center text-zinc-500 text-xs">🏟 {next.venue} · {fmtDate(next.date)}</div>
        </Card>
      )}

      {/* Upcoming */}
      {!next && upcomingMatches.length > 0 && (
        <Card className="p-6 space-y-4 border-amber-500/20">
          <div className="text-amber-400 font-bold text-xs uppercase tracking-widest">Next Upcoming</div>
          {upcomingMatches.slice(0, 3).map(m => (
            <div key={m.match} className="flex items-center justify-between py-2 border-b border-[#2a3146] last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xl">{flag(m.home)}</span>
                <span className="font-medium text-sm">{m.home}</span>
                <span className="text-zinc-600 text-xs">vs</span>
                <span className="font-medium text-sm">{m.away}</span>
                <span className="text-xl">{flag(m.away)}</span>
              </div>
              <div className="text-right">
                <div className="text-zinc-400 text-[10px]">{fmtDate(m.date)}</div>
                <div className="text-amber-400 text-[10px]">{timeDisplay(m)}</div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Group Leaders */}
      <div className="space-y-3">
        <h3 className="text-amber-400 font-bold text-xs uppercase tracking-widest px-1">Group Leaders</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {groups.map(g => {
            const leader = standings[g]?.[0];
            if (!leader) return null;
            return (
              <Card key={g} className="p-3">
                <div className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Group {g}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xl">{flag(leader.team)}</span>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{leader.team}</div>
                    <div className="text-amber-400 text-xs font-bold">{leader.pts} pts</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StandingsTab({ standings, liveMatches, upcomingMatches }: { standings: Record<string, Standing[]>; liveMatches: Match[]; upcomingMatches: Match[] }) {
  const groups = Object.keys(standings).sort();
  const [sel, setSel] = useState(groups[0] || 'A');
  const data = standings[sel] || [];

  return (
    <div className="space-y-6">
      {/* Live */}
      {liveMatches.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-red-400 font-bold text-xs uppercase tracking-widest px-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live Now
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {liveMatches.map(m => (
              <Card key={m.match} className="p-4 border-red-500/20">
                <div className="flex items-center justify-between mb-2">
                  <LiveDot />
                  <span className="text-zinc-500 text-[10px]">{m.group}</span>
                </div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">{flag(m.home)}</span><span className="font-medium text-sm">{m.home}</span></div><span className="text-amber-400 font-black text-lg">{m.home_score ?? '-'}</span></div>
                <div className="flex items-center justify-between mt-1"><div className="flex items-center gap-2"><span className="text-lg">{flag(m.away)}</span><span className="font-medium text-sm">{m.away}</span></div><span className="text-amber-400 font-black text-lg">{m.away_score ?? '-'}</span></div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Group Tables */}
      <div className="space-y-3">
        <h3 className="text-amber-400 font-bold text-xs uppercase tracking-widest px-1">Group Standings</h3>
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {groups.map(g => (
            <button key={g} onClick={() => setSel(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${sel === g ? 'bg-amber-400 text-zinc-900 shadow-lg shadow-amber-400/20' : 'bg-[#1a1f2e] text-zinc-400 border border-[#2a3146] hover:border-amber-400/30'}`}>
              {g}
            </button>
          ))}
        </div>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#2a3146]">
              {['#', 'Team', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'].map(h => (
                <th key={h} className={`px-2 py-3 text-[10px] font-bold uppercase tracking-wider ${h === 'Pts' ? 'text-amber-400' : 'text-zinc-500'} ${h === 'Team' ? 'text-left' : 'text-center'}`}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {data.map((s, i) => (
                <tr key={s.team} className={`border-b border-[#2a3146]/50 ${i < 2 ? 'bg-amber-400/5' : ''}`}>
                  <td className="px-2 py-2.5"><span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${i < 2 ? 'bg-amber-400/20 text-amber-400' : 'bg-[#2a3146] text-zinc-500'}`}>{i + 1}</span></td>
                  <td className="px-2 py-2.5"><div className="flex items-center gap-2"><span>{flag(s.team)}</span><span className="font-medium">{s.team}</span></div></td>
                  <td className="text-center px-2 py-2.5 text-zinc-300">{s.pld}</td>
                  <td className="text-center px-2 py-2.5 text-zinc-300">{s.w}</td>
                  <td className="text-center px-2 py-2.5 text-zinc-300">{s.d}</td>
                  <td className="text-center px-2 py-2.5 text-zinc-300">{s.l}</td>
                  <td className="text-center px-2 py-2.5 text-zinc-300">{s.gf}</td>
                  <td className="text-center px-2 py-2.5 text-zinc-300">{s.ga}</td>
                  <td className="text-center px-2 py-2.5 text-zinc-300">{s.gd}</td>
                  <td className="text-center px-2 py-2.5 text-amber-400 font-black">{s.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Upcoming */}
      <div className="space-y-3">
        <h3 className="text-amber-400 font-bold text-xs uppercase tracking-widest px-1">Upcoming Matches</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {upcomingMatches.slice(0, 6).map(m => (
            <Card key={m.match} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-500 text-[9px] font-bold uppercase">{m.group || roundLabel(m.round)}</span>
                <span className="text-zinc-600 text-[9px]">{fmtDate(m.date)}</span>
              </div>
              <div className="flex items-center justify-around">
                <div className="text-center"><div className="text-2xl">{flag(m.home)}</div><div className="text-xs font-medium mt-1">{m.home}</div></div>
                <div className="text-zinc-600 font-bold text-xs">VS</div>
                <div className="text-center"><div className="text-2xl">{flag(m.away)}</div><div className="text-xs font-medium mt-1">{m.away}</div></div>
              </div>
              <div className="text-[9px] text-zinc-500 text-center mt-2">{timeDisplay(m)}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScheduleTab({ schedule }: { schedule: Record<string, Match[]> }) {
  const [sel, setSel] = useState('group_stage');
  const rounds = Object.keys(schedule);
  const filtered = (schedule[sel] || []);
  const byDate: Record<string, Match[]> = {};
  filtered.forEach(m => { (byDate[m.date] = byDate[m.date] || []).push(m); });

  return (
    <div className="space-y-6">
      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {rounds.map(r => (
          <button key={r} onClick={() => setSel(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${sel === r ? 'bg-amber-400 text-zinc-900 shadow-lg shadow-amber-400/20' : 'bg-[#1a1f2e] text-zinc-400 border border-[#2a3146]'}`}>
            {roundLabel(r)} ({schedule[r]?.length || 0})
          </button>
        ))}
      </div>
      {Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, matches]) => (
        <div key={date} className="space-y-3">
          <div className="flex items-center gap-3 px-1">
            <h4 className="text-zinc-200 font-bold text-sm whitespace-nowrap">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
            <div className="flex-1 h-px bg-[#2a3146]" />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {matches.map(m => (
              <Card key={m.match} className={`p-4 space-y-3 ${m.status === '🔴 LIVE' ? 'border-red-500/30' : (m.home_score !== null || m.status === 'Final' || m.status === 'FT') ? 'opacity-75' : ''}`}>
                <div className="flex items-center justify-between">
                  {m.status === '🔴 LIVE' ? <LiveDot /> : (m.home_score !== null || m.status === 'Final' || m.status === 'FT') ? <span className="text-zinc-500 text-[10px] font-bold uppercase">FT</span> : <span className="text-emerald-400/80 text-[10px] font-bold uppercase">Upcoming</span>}
                  {m.group && <span className="text-zinc-500 text-[9px] font-bold">{m.group}</span>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-xl">{flag(m.home)}</span><span className="font-medium">{m.home}</span></div><span className={`font-black text-lg ${m.status === '🔴 LIVE' ? 'text-amber-400' : 'text-zinc-300'}`}>{m.home_score ?? '-'}</span></div>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-xl">{flag(m.away)}</span><span className="font-medium">{m.away}</span></div><span className={`font-black text-lg ${m.status === '🔴 LIVE' ? 'text-amber-400' : 'text-zinc-300'}`}>{m.away_score ?? '-'}</span></div>
                </div>
                <div className="pt-2 border-t border-[#2a3146] space-y-1">
                  <div className="text-[9px] text-zinc-500 text-center">{timeDisplay(m)}</div>
                  <div className="text-[9px] text-zinc-600 text-center">🏟 {m.venue}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LeaderboardTab({ scorers, rankings }: { scorers: Scorer[]; rankings: Ranking[] }) {
  const maxGoals = scorers[0]?.goals || 1;
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-amber-400 font-bold text-xs uppercase tracking-widest px-1">FIFA Rankings</h3>
        <Card className="p-4 space-y-3">
          {rankings.map(r => (
            <div key={r.rank} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${r.rank <= 3 ? 'bg-amber-400/20 text-amber-400' : 'bg-[#2a3146] text-zinc-400'}`}>{r.rank}</span>
              <span className="text-lg flex-shrink-0">{flag(r.team)}</span>
              <span className="font-medium text-sm w-24 flex-shrink-0 truncate">{r.team}</span>
              <div className="flex-1 bg-[#2a3146] rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full" style={{ width: `${(r.points / 1901) * 100}%` }} />
              </div>
              <span className="text-zinc-400 text-xs font-mono w-10 text-right flex-shrink-0">{r.points}</span>
            </div>
          ))}
        </Card>
      </div>
      <div className="space-y-3">
        <h3 className="text-amber-400 font-bold text-xs uppercase tracking-widest px-1">Golden Boot</h3>
        <Card className="p-4 space-y-3">
          {scorers.slice(0, 15).map((s, i) => (
            <div key={s.rank} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${i < 3 ? 'bg-amber-400/20 text-amber-400' : 'bg-[#2a3146] text-zinc-400'}`}>{s.rank}</span>
              <span className="text-lg flex-shrink-0">{flag(s.team)}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{s.player}</div>
                <div className="text-zinc-500 text-[10px]">{s.team}</div>
              </div>
              <div className="flex-1 bg-[#2a3146] rounded-full h-2.5 overflow-hidden max-w-28">
                <div className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full" style={{ width: `${(s.goals / maxGoals) * 100}%` }} />
              </div>
              <div className="text-right flex-shrink-0 w-14">
                <div className="text-amber-400 font-black text-sm">{s.goals} ⚽</div>
                <div className="text-zinc-500 text-[9px]">{s.assists} Ast</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function ChatTab({ standings, liveMatches, upcomingMatches, scorers, rankings }: {
  standings: Record<string, Standing[]>; liveMatches: Match[]; upcomingMatches: Match[]; scorers: Scorer[]; rankings: Ranking[];
}) {
  const [msgs, setMsgs] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: '👋 Hey! I have access to live FIFA 2026 data from ESPN. Ask me about standings, live scores, schedule, scorers, rankings, or any team!' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const respond = useCallback((q: string): string => {
    const lc = q.toLowerCase();

    if (lc.includes('standing') || lc.includes('group') || lc.includes('table') || lc.includes('points')) {
      const m = lc.match(/group\s*([a-l])/i);
      if (m) {
        const g = m[1].toUpperCase();
        const s = standings[g];
        if (s) return `📊 Group ${g} Standings:\n\n${s.map((t, i) => `${i + 1}. ${flag(t.team)} ${t.team} — ${t.pts}pts (${t.w}W ${t.d}D ${t.l}L, GD:${t.gd})`).join('\n')}`;
        return `Group ${g} not found. Available: ${Object.keys(standings).join(', ')}`;
      }
      return `📊 Group Leaders:\n\n${Object.entries(standings).sort(([a], [b]) => a.localeCompare(b)).map(([g, s]) => `Group ${g}: ${flag(s[0].team)} ${s[0].team} (${s[0].pts}pts)`).join('\n')}`;
    }

    if (lc.includes('live') || lc.includes('score') || lc.includes('now')) {
      if (!liveMatches.length) return 'No matches are currently live. Check the schedule for upcoming matches!';
      return `🔴 Live Now:\n\n${liveMatches.map(m => `${flag(m.home)} ${m.home} ${m.home_score ?? '-'} - ${m.away_score ?? '-'} ${m.away} ${flag(m.away)}\n${m.group} · 🏟 ${m.venue}`).join('\n\n')}`;
    }

    if (lc.includes('schedule') || lc.includes('when') || lc.includes('upcoming') || lc.includes('next') || lc.includes('match')) {
      const u = upcomingMatches.slice(0, 5);
      if (!u.length) return 'No upcoming matches scheduled.';
      return `📅 Upcoming Matches:\n\n${u.map(m => `${flag(m.home)} ${m.home} vs ${m.away} ${flag(m.away)}\n${fmtDate(m.date)} · ${timeDisplay(m)}\n🏟 ${m.venue}`).join('\n\n')}`;
    }

    if (lc.includes('scorer') || lc.includes('goal') || lc.includes('golden boot')) {
      return `⚽ Golden Boot:\n\n${scorers.slice(0, 10).map((s, i) => `${i + 1}. ${s.player} ${flag(s.team)} — ${s.goals}G ${s.assists}A`).join('\n')}`;
    }

    if (lc.includes('rank') || lc.includes('fifa')) {
      return `🏆 FIFA Rankings:\n\n${rankings.map(r => `${r.rank}. ${flag(r.team)} ${r.team} — ${r.points} pts`).join('\n')}`;
    }

    // Team search
    const allTeams = new Set<string>();
    Object.values(standings).forEach(arr => arr.forEach(s => allTeams.add(s.team)));
    const matchedTeam = [...allTeams].find(t => lc.includes(t.toLowerCase().replace(/\s/g, '')));
    if (matchedTeam) {
      let resp = `${flag(matchedTeam)} **${matchedTeam}**\n\n`;
      for (const [g, teams] of Object.entries(standings)) {
        if (teams.find(t => t.team === matchedTeam)) {
          const t = teams.find(x => x.team === matchedTeam)!;
          resp += `📊 Group ${g}: ${t.pos}nd place, ${t.pts}pts (${t.w}W ${t.d}D ${t.l}L)\n`;
        }
      }
      const rk = rankings.find(r => r.team === matchedTeam);
      if (rk) resp += `🏆 FIFA Rank: #${rk.rank}\n`;
      const sc = scorers.find(s => s.team === matchedTeam);
      if (sc) resp += `⚽ ${sc.player}: ${sc.goals} goals\n`;
      const teamMatches = [...liveMatches, ...upcomingMatches].filter(m => m.home === matchedTeam || m.away === matchedTeam);
      if (teamMatches.length > 0) {
        resp += `\n📋 Matches:\n`;
        resp += teamMatches.slice(0, 5).map(m => {
          const opp = m.home === matchedTeam ? m.away : m.home;
          const status = m.status === '🔴 LIVE' ? `LIVE ${m.home_score}-${m.away_score}` : (m.home_score !== null) ? `FT ${m.home_score}-${m.away_score}` : `${fmtDate(m.date)}`;
          return `vs ${flag(opp)} ${opp} — ${status}`;
        }).join('\n');
      }
      return resp;
    }

    if (lc.includes('help')) return 'Try:\n• "standings" or "Group A"\n• "live" — current scores\n• "schedule" — upcoming matches\n• "scorers" — golden boot\n• "rankings" — FIFA rankings\n• Any team name (e.g. "Brazil", "Messi")';

    return 'Try asking about: standings, live scores, schedule, scorers, rankings, or a team name. Type "help" for all options.';
  }, [standings, liveMatches, upcomingMatches, scorers, rankings]);

  const send = () => {
    const t = input.trim(); if (!t) return;
    setMsgs(p => [...p, { role: 'user', text: t }]); setInput(''); setTyping(true);
    setTimeout(() => { setMsgs(p => [...p, { role: 'bot', text: respond(t) }]); setTyping(false); }, 400 + Math.random() * 400);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)]">
      <div className="flex-1 overflow-y-auto space-y-3 p-1 pb-4">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-amber-400/20 text-zinc-100 rounded-br-md' : 'bg-[#1a1f2e] border border-[#2a3146] text-zinc-200 rounded-bl-md'}`}>
              {m.text.split('\n').map((l, j) => <span key={j}>{l}{j < m.text.split('\n').length - 1 && <br />}</span>)}
            </div>
          </div>
        ))}
        {typing && <div className="flex justify-start"><div className="bg-[#1a1f2e] border border-[#2a3146] rounded-2xl rounded-bl-md px-4 py-3"><div className="flex gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} /><span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} /><span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} /></div></div></div>}
        <div ref={endRef} />
      </div>
      <div className="sticky bottom-0 bg-[#0a0e17]/95 backdrop-blur-sm border-t border-[#2a3146] pt-3 pb-1">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
            placeholder="Ask about standings, live scores, schedule..."
            className="flex-1 bg-[#1a1f2e] border border-[#2a3146] rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 transition-all" />
          <button onClick={send} disabled={!input.trim() || typing}
            className="bg-amber-400 hover:bg-amber-300 disabled:bg-[#2a3146] disabled:text-zinc-600 text-zinc-900 font-bold rounded-xl px-5 py-2.5 text-sm transition-all">Send</button>
        </div>
        <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
          {['Live scores', 'Group A', 'Top scorers', 'Schedule', 'Rankings', 'Brazil', 'Help'].map(h => (
            <button key={h} onClick={() => setInput(h)} className="px-2.5 py-1 rounded-lg bg-[#1a1f2e] text-zinc-400 text-[10px] hover:bg-[#2a3146] transition-all whitespace-nowrap border border-[#2a3146]/50">{h}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function Page() {
  const { standings, schedule, scorers, rankings, liveMatches, upcomingMatches, loading, error, lastUpdated, reload } = useLiveData();
  const [tab, setTab] = useState('Home');
  const tabs = ['Home', 'Standings', 'Schedule', 'Leaderboard', 'Chat'];
  const icons: Record<string, string> = { Home: '🏠', Standings: '📊', Schedule: '📅', Leaderboard: '🏆', Chat: '💬' };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={reload} />;

  return (
    <div className="min-h-screen bg-[#0a0e17] text-zinc-100">
      <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20">
        {/* Tab Bar */}
        <div className="sticky top-0 z-50 bg-[#0a0e17]/95 backdrop-blur-md -mx-4 md:-mx-6 px-4 md:px-6 py-3 mb-5 border-b border-[#2a3146]/50">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${tab === t ? 'bg-amber-400 text-zinc-900 shadow-lg shadow-amber-400/20' : 'bg-[#1a1f2e] text-zinc-400 border border-[#2a3146] hover:border-amber-400/30'}`}>
                <span>{icons[t]}</span><span className="hidden sm:inline">{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {tab === 'Home' && <HomeTab liveMatches={liveMatches} upcomingMatches={upcomingMatches} standings={standings} />}
        {tab === 'Standings' && <StandingsTab standings={standings} liveMatches={liveMatches} upcomingMatches={upcomingMatches} />}
        {tab === 'Schedule' && <ScheduleTab schedule={schedule} />}
        {tab === 'Leaderboard' && <LeaderboardTab scorers={scorers} rankings={rankings} />}
        {tab === 'Chat' && <ChatTab standings={standings} liveMatches={liveMatches} upcomingMatches={upcomingMatches} scorers={scorers} rankings={rankings} />}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0e17]/90 backdrop-blur-sm border-t border-[#2a3146]/50 py-2 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {liveMatches.length > 0 && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 text-[10px] font-bold">{liveMatches.length} LIVE</span>
              </>
            )}
            {lastUpdated && <span className="text-zinc-600 text-[9px]">Updated {new Date(lastUpdated).toLocaleTimeString()}</span>}
          </div>
          <span className="text-zinc-600 text-[10px]">Data: ESPN API</span>
        </div>
      </div>
    </div>
  );
}
