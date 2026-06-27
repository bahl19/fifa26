'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const TEAM_FLAGS: Record<string, string> = {
  Argentina:'🇦🇷',Brazil:'🇧🇷',France:'🇫🇷',Germany:'🇩🇪',Spain:'🇪🇸',England:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',Italy:'🇮🇹',Netherlands:'🇳🇱',
  Portugal:'🇵🇹',Belgium:'🇧🇪',Croatia:'🇭🇷',Uruguay:'🇺🇾',Colombia:'🇨🇴',USA:'🇺🇸',Mexico:'🇲🇽',Canada:'🇨🇦',
  CostaRica:'🇨🇷',SaudiArabia:'🇸🇦',Japan:'🇯🇵',SouthKorea:'🇰🇷',Australia:'🇦🇺',Morocco:'🇲🇦',Senegal:'🇸🇳',Egypt:'🇪🇬',
  Nigeria:'🇳🇬',Poland:'🇵🇱',Denmark:'🇩🇰',Switzerland:'🇨🇭',Sweden:'🇸🇪',Norway:'🇳🇴',Türkiye:'🇹🇷',Paraguay:'🇵🇾',
  Chile:'🇨🇱',Peru:'🇵🇪',Ecuador:'🇪🇨',Cameroon:'🇨🇲',Ghana:'🇬🇭',Tunisia:'🇹🇳',Iran:'🇮🇷',IvoryCoast:'🇨🇮',
  Qatar:'🇶🇦',Iraq:'🇮🇶',SouthAfrica:'🇿🇦',TBD:'❓',Jamaica:'🇯🇲'
};
const flag = (t: string) => TEAM_FLAGS[t] || '⚽';

const GROUPS: Record<string, string[]> = {
  A:['Mexico','Canada','CostaRica','USA'], B:['Brazil','Argentina','Uruguay','Paraguay'],
  C:['France','Germany','Spain','Italy'], D:['England','Netherlands','Belgium','Switzerland'],
  E:['Japan','SouthKorea','Australia','SaudiArabia'], F:['Portugal','Poland','Croatia','Denmark'],
  G:['Morocco','Senegal','Egypt','Nigeria'], H:['Colombia','Ecuador','Chile','Peru'],
};

interface Match { id:string; home:string; away:string; homeScore:number|null; awayScore:number|null; group:string; round:string; date:string; timeUTC:string; status:'upcoming'|'live'|'completed'; venue:string; minute?:number; }

const MATCHES: Match[] = [
  {id:'m1',home:'Mexico',away:'Canada',homeScore:2,awayScore:1,group:'A',round:'group_stage',date:'2026-06-27',timeUTC:'18:00',status:'live',venue:'Estadio Azteca',minute:67},
  {id:'m2',home:'CostaRica',away:'USA',homeScore:1,awayScore:1,group:'A',round:'group_stage',date:'2026-06-27',timeUTC:'20:00',status:'live',venue:'BMO Field',minute:34},
  {id:'m3',home:'Brazil',away:'Argentina',homeScore:null,awayScore:null,group:'B',round:'group_stage',date:'2026-06-27',timeUTC:'22:00',status:'upcoming',venue:'SoFi Stadium'},
  {id:'m4',home:'Uruguay',away:'Paraguay',homeScore:3,awayScore:0,group:'B',round:'group_stage',date:'2026-06-26',timeUTC:'20:00',status:'completed',venue:'MetLife Stadium'},
  {id:'m5',home:'France',away:'Germany',homeScore:null,awayScore:null,group:'C',round:'group_stage',date:'2026-06-28',timeUTC:'18:00',status:'upcoming',venue:'Hard Rock Stadium'},
  {id:'m6',home:'Spain',away:'Italy',homeScore:2,awayScore:2,group:'C',round:'group_stage',date:'2026-06-26',timeUTC:'18:00',status:'completed',venue:'AT&T Stadium'},
  {id:'m7',home:'England',away:'Netherlands',homeScore:null,awayScore:null,group:'D',round:'group_stage',date:'2026-06-28',timeUTC:'20:00',status:'upcoming',venue:'Wembley Stadium'},
  {id:'m8',home:'Belgium',away:'Switzerland',homeScore:1,awayScore:0,group:'D',round:'group_stage',date:'2026-06-26',timeUTC:'22:00',status:'completed',venue:'Lumen Field'},
  {id:'m9',home:'Japan',away:'SouthKorea',homeScore:null,awayScore:null,group:'E',round:'group_stage',date:'2026-06-29',timeUTC:'14:00',status:'upcoming',venue:'Nissan Stadium'},
  {id:'m10',home:'Portugal',away:'Poland',homeScore:null,awayScore:null,group:'F',round:'group_stage',date:'2026-06-29',timeUTC:'18:00',status:'upcoming',venue:'Estádio da Luz'},
  {id:'m11',home:'Morocco',away:'Senegal',homeScore:2,awayScore:0,group:'G',round:'group_stage',date:'2026-06-26',timeUTC:'18:00',status:'completed',venue:'Stade Mohammed V'},
  {id:'m12',home:'Colombia',away:'Ecuador',homeScore:3,awayScore:1,group:'H',round:'group_stage',date:'2026-06-26',timeUTC:'20:00',status:'completed',venue:'El Campín'},
];

const STANDINGS: Record<string,{team:string;pld:number;w:number;d:number;l:number;gf:number;ga:number;pts:number}[]> = {
  A:[{team:'Mexico',pld:2,w:1,d:1,l:0,gf:4,ga:2,pts:4},{team:'USA',pld:2,w:1,d:0,l:1,gf:3,ga:3,pts:3},{team:'Canada',pld:2,w:0,d:2,l:0,gf:2,ga:2,pts:2},{team:'CostaRica',pld:2,w:0,d:1,l:1,gf:1,ga:3,pts:1}],
  B:[{team:'Uruguay',pld:1,w:1,d:0,l:0,gf:3,ga:0,pts:3},{team:'Brazil',pld:0,w:0,d:0,l:0,gf:0,ga:0,pts:0},{team:'Argentina',pld:0,w:0,d:0,l:0,gf:0,ga:0,pts:0},{team:'Paraguay',pld:1,w:0,d:0,l:1,gf:0,ga:3,pts:0}],
  C:[{team:'Spain',pld:1,w:0,d:1,l:0,gf:2,ga:2,pts:1},{team:'Italy',pld:1,w:0,d:1,l:0,gf:2,ga:2,pts:1},{team:'France',pld:0,w:0,d:0,l:0,gf:0,ga:0,pts:0},{team:'Germany',pld:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}],
  D:[{team:'Belgium',pld:1,w:1,d:0,l:0,gf:1,ga:0,pts:3},{team:'England',pld:0,w:0,d:0,l:0,gf:0,ga:0,pts:0},{team:'Netherlands',pld:0,w:0,d:0,l:0,gf:0,ga:0,pts:0},{team:'Switzerland',pld:1,w:0,d:0,l:1,gf:0,ga:1,pts:0}],
  E:[{team:'SaudiArabia',pld:1,w:1,d:0,l:0,gf:2,ga:0,pts:3},{team:'Japan',pld:0,w:0,d:0,l:0,gf:0,ga:0,pts:0},{team:'SouthKorea',pld:0,w:0,d:0,l:0,gf:0,ga:0,pts:0},{team:'Australia',pld:1,w:0,d:0,l:1,gf:0,ga:2,pts:0}],
  F:[{team:'Poland',pld:1,w:0,d:1,l:0,gf:1,ga:1,pts:1},{team:'Croatia',pld:1,w:0,d:1,l:0,gf:1,ga:1,pts:1},{team:'Portugal',pld:0,w:0,d:0,l:0,gf:0,ga:0,pts:0},{team:'Denmark',pld:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}],
  G:[{team:'Morocco',pld:1,w:1,d:0,l:0,gf:2,ga:0,pts:3},{team:'Egypt',pld:0,w:0,d:0,l:0,gf:0,ga:0,pts:0},{team:'Nigeria',pld:0,w:0,d:0,l:0,gf:0,ga:0,pts:0},{team:'Senegal',pld:1,w:0,d:0,l:1,gf:0,ga:2,pts:0}],
  H:[{team:'Colombia',pld:1,w:1,d:0,l:0,gf:3,ga:1,pts:3},{team:'Chile',pld:0,w:0,d:0,l:0,gf:0,ga:0,pts:0},{team:'Ecuador',pld:1,w:0,d:0,l:1,gf:1,ga:3,pts:0},{team:'Peru',pld:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}],
};

const SCORERS = [
  {name:'Vinícius Jr.',team:'Brazil',goals:5,assists:2},
  {name:'Kylian Mbappé',team:'France',goals:4,assists:3},
  {name:'Erling Haaland',team:'Norway',goals:4,assists:1},
  {name:'Julián Álvarez',team:'Argentina',goals:3,assists:2},
  {name:'Harry Kane',team:'England',goals:3,assists:1},
  {name:'Lamine Yamal',team:'Spain',goals:3,assists:2},
  {name:'Mohamed Salah',team:'Egypt',goals:2,assists:3},
  {name:'Cristiano Ronaldo',team:'Portugal',goals:2,assists:1},
];

const RANKINGS = [
  {rank:1,team:'Argentina',pts:1901},{rank:2,team:'France',pts:1854},{rank:3,team:'Belgium',pts:1836},
  {rank:4,team:'Brazil',pts:1818},{rank:5,team:'England',pts:1795},{rank:6,team:'Netherlands',pts:1771},
  {rank:7,team:'Portugal',pts:1761},{rank:8,team:'Spain',pts:1749},{rank:9,team:'Italy',pts:1726},
  {rank:10,team:'Croatia',pts:1714},{rank:11,team:'Germany',pts:1698},{rank:12,team:'Morocco',pts:1682},
];

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

function toTZ(timeUTC: string, tz: 'IST'|'ET'|'CT'|'PT'): string {
  const [h,m] = timeUTC.split(':').map(Number);
  const off: Record<string,number> = {IST:5.5,ET:-4,CT:-5,PT:-7};
  let total = h*60+m+off[tz]*60;
  if(total<0) total+=1440; if(total>=1440) total-=1440;
  const hr = Math.floor(total/60); const mn = Math.round(total%60);
  const ampm = hr>=12?'PM':'AM'; const h12 = hr===0?12:hr>12?hr-12:hr;
  return `${h12}:${mn.toString().padStart(2,'0')} ${ampm} ${tz}`;
}

function fmtDate(d: string) {
  return new Date(d+'T00:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
}

function roundLabel(r: string) {
  return {group_stage:'Group Stage',round_of_32:'Round of 32',round_of_16:'Round of 16',quarter_finals:'Quarter Finals',semi_finals:'Semi Finals',final:'Grand Final'}[r]||r;
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function LiveDot() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"/>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"/>
      </span>
      <span className="text-red-400 font-bold text-[10px] uppercase tracking-widest">Live</span>
    </span>
  );
}

function Card({children,className=''}:{children:React.ReactNode;className?:string}) {
  return <div className={`bg-[#1a1f2e] border border-[#2a3146] rounded-2xl ${className}`}>{children}</div>;
}

function Countdown({target}:{target:Date}) {
  const [t,setT] = useState({d:0,h:0,m:0,s:0});
  useEffect(()=>{
    const tick=()=>{const diff=Math.max(0,target.getTime()-Date.now());
      setT({d:Math.floor(diff/864e5),h:Math.floor((diff%864e5)/36e5),m:Math.floor((diff%36e5)/6e4),s:Math.floor((diff%6e4)/1e3)});
    };tick();const id=setInterval(tick,1000);return()=>clearInterval(id);
  },[target]);
  return (
    <div className="flex gap-3 justify-center">
      {[{v:t.d,l:'DAYS'},{v:t.h,l:'HRS'},{v:t.m,l:'MIN'},{v:t.s,l:'SEC'}].map(({v,l})=>(
        <div key={l} className="bg-[#0f1219] rounded-xl px-4 py-3 text-center min-w-[60px] border border-[#2a3146]">
          <div className="text-amber-400 font-mono font-black text-2xl">{v.toString().padStart(2,'0')}</div>
          <div className="text-zinc-500 text-[9px] font-bold tracking-widest mt-0.5">{l}</div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════════════════ */

function HomeTab() {
  const next = MATCHES.find(m=>m.status==='upcoming');
  const target = next?new Date(`${next.date}T${next.timeUTC}Z`):new Date('2026-06-28T18:00:00Z');
  const live = MATCHES.filter(m=>m.status==='live');
  const groups = Object.keys(GROUPS).sort();

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center space-y-2 pt-2">
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
          ⚽ FIFA World Cup 2026
        </h1>
        <p className="text-zinc-500 text-sm">USA · Mexico · Canada &mdash; June 11 &ndash; July 19</p>
      </div>

      {/* Next Match Countdown */}
      {next && (
        <Card className="p-6 space-y-4 border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">Next Match</span>
            <span className="text-zinc-500 text-[10px]">{toTZ(next.timeUTC,'IST')} · {toTZ(next.timeUTC,'ET')}</span>
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
          <Countdown target={target}/>
          <div className="text-center text-zinc-500 text-xs">🏟 {next.venue}</div>
        </Card>
      )}

      {/* Live */}
      {live.length>0 && (
        <div className="space-y-3">
          <h3 className="text-red-400 font-bold text-xs uppercase tracking-widest px-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/> Live Now
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {live.map(m=>(
              <Card key={m.id} className="p-4 space-y-3 border-red-500/20">
                <div className="flex items-center justify-between">
                  <LiveDot/>
                  <span className="text-zinc-500 text-[10px]">Group {m.group} · {m.minute}&apos;</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><span className="text-xl">{flag(m.home)}</span><span className="font-medium text-sm">{m.home}</span></div>
                    <span className="text-amber-400 font-black text-xl">{m.homeScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><span className="text-xl">{flag(m.away)}</span><span className="font-medium text-sm">{m.away}</span></div>
                    <span className="text-amber-400 font-black text-xl">{m.awayScore}</span>
                  </div>
                </div>
                <div className="text-zinc-600 text-[10px] text-center pt-1 border-t border-[#2a3146]">{m.venue}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Group Leaders */}
      <div className="space-y-3">
        <h3 className="text-amber-400 font-bold text-xs uppercase tracking-widest px-1">Group Leaders</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {groups.slice(0,8).map(g=>{
            const s = STANDINGS[g]?.[0];
            return (
              <Card key={g} className="p-3">
                <div className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Group {g}</div>
                {s && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xl">{flag(s.team)}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{s.team}</div>
                      <div className="text-amber-400 text-xs font-bold">{s.pts} pts</div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StandingsTab() {
  const [sel,setSel] = useState('A');
  const groups = Object.keys(STANDINGS).sort();
  const live = MATCHES.filter(m=>m.status==='live');
  const upcoming = MATCHES.filter(m=>m.status==='upcoming').slice(0,6);
  const data = STANDINGS[sel]||[];

  return (
    <div className="space-y-6">
      {live.length>0 && (
        <div className="space-y-3">
          <h3 className="text-red-400 font-bold text-xs uppercase tracking-widest px-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/> Live Now
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {live.map(m=>(
              <Card key={m.id} className="p-4 border-red-500/20">
                <div className="flex items-center justify-between mb-2">
                  <LiveDot/>
                  <span className="text-zinc-500 text-[10px]">Group {m.group} · {m.minute}&apos;</span>
                </div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">{flag(m.home)}</span><span className="font-medium text-sm">{m.home}</span></div><span className="text-amber-400 font-black text-lg">{m.homeScore}</span></div>
                <div className="flex items-center justify-between mt-1"><div className="flex items-center gap-2"><span className="text-lg">{flag(m.away)}</span><span className="font-medium text-sm">{m.away}</span></div><span className="text-amber-400 font-black text-lg">{m.awayScore}</span></div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-amber-400 font-bold text-xs uppercase tracking-widest px-1">Group Standings</h3>
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {groups.map(g=>(
            <button key={g} onClick={()=>setSel(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${sel===g?'bg-amber-400 text-zinc-900 shadow-lg shadow-amber-400/20':'bg-[#1a1f2e] text-zinc-400 border border-[#2a3146] hover:border-amber-400/30'}`}>
              {g}
            </button>
          ))}
        </div>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#2a3146]">
              {['#','Team','P','W','D','L','GF','GA','GD','Pts'].map(h=>(
                <th key={h} className={`px-2 py-3 text-[10px] font-bold uppercase tracking-wider ${h==='Pts'?'text-amber-400':'text-zinc-500'} ${h==='Team'?'text-left':'text-center'}`}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {data.map((s,i)=>(
                <tr key={s.team} className={`border-b border-[#2a3146]/50 ${i<2?'bg-amber-400/5':''}`}>
                  <td className="px-2 py-2.5"><span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${i<2?'bg-amber-400/20 text-amber-400':'bg-[#2a3146] text-zinc-500'}`}>{i+1}</span></td>
                  <td className="px-2 py-2.5"><div className="flex items-center gap-2"><span>{flag(s.team)}</span><span className="font-medium">{s.team}</span></div></td>
                  <td className="text-center px-2 py-2.5 text-zinc-300">{s.pld}</td>
                  <td className="text-center px-2 py-2.5 text-zinc-300">{s.w}</td>
                  <td className="text-center px-2 py-2.5 text-zinc-300">{s.d}</td>
                  <td className="text-center px-2 py-2.5 text-zinc-300">{s.l}</td>
                  <td className="text-center px-2 py-2.5 text-zinc-300">{s.gf}</td>
                  <td className="text-center px-2 py-2.5 text-zinc-300">{s.ga}</td>
                  <td className="text-center px-2 py-2.5 text-zinc-300">{s.gf-s.ga>0?'+':''}{s.gf-s.ga}</td>
                  <td className="text-center px-2 py-2.5 text-amber-400 font-black">{s.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="text-amber-400 font-bold text-xs uppercase tracking-widest px-1">Upcoming</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {upcoming.map(m=>(
            <Card key={m.id} className="p-3">
              <div className="flex items-center justify-between mb-2">
                {m.group && <span className="text-zinc-500 text-[9px] font-bold uppercase">Group {m.group}</span>}
                <span className="text-zinc-600 text-[9px]">{fmtDate(m.date)}</span>
              </div>
              <div className="flex items-center justify-around">
                <div className="text-center"><div className="text-2xl">{flag(m.home)}</div><div className="text-xs font-medium mt-1">{m.home}</div></div>
                <div className="text-zinc-600 font-bold text-xs">VS</div>
                <div className="text-center"><div className="text-2xl">{flag(m.away)}</div><div className="text-xs font-medium mt-1">{m.away}</div></div>
              </div>
              <div className="text-[9px] text-zinc-500 text-center mt-2">{toTZ(m.timeUTC,'IST')} · {toTZ(m.timeUTC,'ET')} · {toTZ(m.timeUTC,'CT')} · {toTZ(m.timeUTC,'PT')}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScheduleTab() {
  const [sel,setSel] = useState('group_stage');
  const rounds = [...new Set(MATCHES.map(m=>m.round))];
  const filtered = MATCHES.filter(m=>m.round===sel);
  const byDate: Record<string,Match[]> = {};
  filtered.forEach(m=>{(byDate[m.date]=byDate[m.date]||[]).push(m);});

  return (
    <div className="space-y-6">
      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {rounds.map(r=>(
          <button key={r} onClick={()=>setSel(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${sel===r?'bg-amber-400 text-zinc-900 shadow-lg shadow-amber-400/20':'bg-[#1a1f2e] text-zinc-400 border border-[#2a3146]'}`}>
            {roundLabel(r)}
          </button>
        ))}
      </div>
      {Object.entries(byDate).sort(([a],[b])=>a.localeCompare(b)).map(([date,matches])=>(
        <div key={date} className="space-y-3">
          <div className="flex items-center gap-3 px-1">
            <h4 className="text-zinc-200 font-bold text-sm whitespace-nowrap">{new Date(date+'T00:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</h4>
            <div className="flex-1 h-px bg-[#2a3146]"/>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {matches.map(m=>(
              <Card key={m.id} className={`p-4 space-y-3 ${m.status==='live'?'border-red-500/30':m.status==='completed'?'opacity-75':''}`}>
                <div className="flex items-center justify-between">
                  {m.status==='live'?<LiveDot/>:m.status==='completed'?<span className="text-zinc-500 text-[10px] font-bold uppercase">FT</span>:<span className="text-emerald-400/80 text-[10px] font-bold uppercase">Upcoming</span>}
                  {m.group && <span className="text-zinc-500 text-[9px] font-bold">Group {m.group}</span>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-xl">{flag(m.home)}</span><span className="font-medium">{m.home}</span></div><span className={`font-black text-lg ${m.status==='live'?'text-amber-400':'text-zinc-300'}`}>{m.homeScore??'-'}</span></div>
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-xl">{flag(m.away)}</span><span className="font-medium">{m.away}</span></div><span className={`font-black text-lg ${m.status==='live'?'text-amber-400':'text-zinc-300'}`}>{m.awayScore??'-'}</span></div>
                </div>
                <div className="pt-2 border-t border-[#2a3146] space-y-1">
                  <div className="text-[9px] text-zinc-500 text-center">{toTZ(m.timeUTC,'IST')} · {toTZ(m.timeUTC,'ET')} · {toTZ(m.timeUTC,'CT')} · {toTZ(m.timeUTC,'PT')}</div>
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

function LeaderboardTab() {
  const maxGoals = SCORERS[0]?.goals||1;
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-amber-400 font-bold text-xs uppercase tracking-widest px-1">FIFA Rankings</h3>
        <Card className="p-4 space-y-3">
          {RANKINGS.map(r=>(
            <div key={r.rank} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${r.rank<=3?'bg-amber-400/20 text-amber-400':'bg-[#2a3146] text-zinc-400'}`}>{r.rank}</span>
              <span className="text-lg flex-shrink-0">{flag(r.team)}</span>
              <span className="font-medium text-sm w-24 flex-shrink-0 truncate">{r.team}</span>
              <div className="flex-1 bg-[#2a3146] rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full" style={{width:`${(r.pts/1901)*100}%`}}/>
              </div>
              <span className="text-zinc-400 text-xs font-mono w-10 text-right flex-shrink-0">{r.pts}</span>
            </div>
          ))}
        </Card>
      </div>
      <div className="space-y-3">
        <h3 className="text-amber-400 font-bold text-xs uppercase tracking-widest px-1">Golden Boot</h3>
        <Card className="p-4 space-y-3">
          {SCORERS.map((s,i)=>(
            <div key={s.name} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${i<3?'bg-amber-400/20 text-amber-400':'bg-[#2a3146] text-zinc-400'}`}>{i+1}</span>
              <span className="text-lg flex-shrink-0">{flag(s.team)}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{s.name}</div>
                <div className="text-zinc-500 text-[10px]">{s.team}</div>
              </div>
              <div className="flex-1 bg-[#2a3146] rounded-full h-2.5 overflow-hidden max-w-28">
                <div className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full" style={{width:`${(s.goals/maxGoals)*100}%`}}/>
              </div>
              <div className="text-right flex-shrink-0 w-14">
                <div className="text-amber-400 font-black text-sm">{s.goals} ⚽</div>
                <div className="text-zinc-500 text-[9px]">{s.assists} Ast</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {l:'Total Goals',v:SCORERS.reduce((a,s)=>a+s.goals,0),i:'⚽'},
          {l:'Assists',v:SCORERS.reduce((a,s)=>a+s.assists,0),i:'🅰️'},
          {l:'Golden Boot',v:`${SCORERS[0].goals} goals`,i:'🥇'},
          {l:'Teams',v:new Set(SCORERS.map(s=>s.team)).size,i:'🌍'},
        ].map(({l,v,i})=>(
          <Card key={l} className="p-3 text-center">
            <div className="text-2xl mb-1">{i}</div>
            <div className="text-amber-400 font-black text-xl">{v}</div>
            <div className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">{l}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ChatTab() {
  const [msgs,setMsgs] = useState<{role:'user'|'bot';text:string}[]>([
    {role:'bot',text:'👋 Hey! Ask me about FIFA 2026 — standings, live scores, schedule, scorers, rankings, or any team!'}
  ]);
  const [input,setInput] = useState('');
  const [typing,setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[msgs]);

  const respond = useCallback((q: string): string => {
    const lc = q.toLowerCase();
    if(lc.includes('standing')||lc.includes('group')||lc.includes('table')||lc.includes('points')) {
      const m = lc.match(/group\s*([a-h])/i);
      if(m){const g=m[1].toUpperCase();const s=STANDINGS[g];if(s)return `📊 Group ${g}:\n\n${s.map((t,i)=>`${i+1}. ${flag(t.team)} ${t.team} — ${t.pts}pts (W${t.w} D${t.d} L${t.l})`).join('\n')}`;return `Group ${g} not found.`;}
      return `📊 Leaders:\n\n${Object.entries(STANDINGS).sort(([a],[b])=>a.localeCompare(b)).map(([g,s])=>`Group ${g}: ${flag(s[0].team)} ${s[0].team} (${s[0].pts}pts)`).join('\n')}`;
    }
    if(lc.includes('live')||lc.includes('score')||lc.includes('now')){const l=MATCHES.filter(m=>m.status==='live');if(!l.length)return 'No live matches right now.';return `🔴 Live:\n\n${l.map(m=>`${flag(m.home)} ${m.home} ${m.homeScore}-${m.awayScore} ${m.away} ${flag(m.away)} (${m.minute}')`).join('\n')}`;}
    if(lc.includes('schedule')||lc.includes('when')||lc.includes('upcoming')||lc.includes('next')||lc.includes('match')){const u=MATCHES.filter(m=>m.status==='upcoming').slice(0,5);return `📅 Upcoming:\n\n${u.map(m=>`${flag(m.home)} ${m.home} vs ${m.away} ${flag(m.away)}\n${fmtDate(m.date)} · ${toTZ(m.timeUTC,'IST')} / ${toTZ(m.timeUTC,'ET')}`).join('\n\n')}`;}
    if(lc.includes('scorer')||lc.includes('goal')||lc.includes('golden boot')){return `⚽ Golden Boot:\n\n${SCORERS.map((s,i)=>`${i+1}. ${s.name} ${flag(s.team)} — ${s.goals}G ${s.assists}A`).join('\n')}`;}
    if(lc.includes('rank')||lc.includes('fifa')){return `🏆 FIFA Rankings:\n\n${RANKINGS.slice(0,10).map(r=>`${r.rank}. ${flag(r.team)} ${r.team} — ${r.pts}`).join('\n')}`;}
    const teamMatch = Object.keys(TEAM_FLAGS).find(t=>lc.includes(t.toLowerCase().replace(/\s/g,'')));
    if(teamMatch){const grp=Object.entries(GROUPS).find(([,t])=>t.includes(teamMatch));const rk=RANKINGS.find(r=>r.team===teamMatch);const sc=SCORERS.find(s=>s.team===teamMatch);let r=`${flag(teamMatch)} **${teamMatch}**\n\n`;if(grp)r+=`📍 Group ${grp[0]}\n`;if(rk)r+=`🏆 Rank #${rk.rank}\n`;if(sc)r+=`⚽ ${sc.name}: ${sc.goals} goals\n`;return r;}
    if(lc.includes('help'))return 'Try: "standings", "Group A", "live", "schedule", "scorers", "rankings", or any team name.';
    return 'Try asking about: standings, live scores, schedule, scorers, rankings, or a team name. Type "help" for all options.';
  },[]);

  const send = () => {
    const t = input.trim(); if(!t) return;
    setMsgs(p=>[...p,{role:'user',text:t}]); setInput(''); setTyping(true);
    setTimeout(()=>{setMsgs(p=>[...p,{role:'bot',text:respond(t)}]);setTyping(false);},500+Math.random()*500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)]">
      <div className="flex-1 overflow-y-auto space-y-3 p-1 pb-4">
        {msgs.map((m,i)=>(
          <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role==='user'?'bg-amber-400/20 text-zinc-100 rounded-br-md':'bg-[#1a1f2e] border border-[#2a3146] text-zinc-200 rounded-bl-md'}`}>
              {m.text.split('\n').map((l,j)=><span key={j}>{l}{j<m.text.split('\n').length-1&&<br/>}</span>)}
            </div>
          </div>
        ))}
        {typing && <div className="flex justify-start"><div className="bg-[#1a1f2e] border border-[#2a3146] rounded-2xl rounded-bl-md px-4 py-3"><div className="flex gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{animationDelay:'0ms'}}/><span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{animationDelay:'150ms'}}/><span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{animationDelay:'300ms'}}/></div></div></div>}
        <div ref={endRef}/>
      </div>
      <div className="sticky bottom-0 bg-[#0a0e17]/95 backdrop-blur-sm border-t border-[#2a3146] pt-3 pb-1">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();send();}}}
            placeholder="Ask about standings, live scores, schedule..."
            className="flex-1 bg-[#1a1f2e] border border-[#2a3146] rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400/50 transition-all"/>
          <button onClick={send} disabled={!input.trim()||typing}
            className="bg-amber-400 hover:bg-amber-300 disabled:bg-[#2a3146] disabled:text-zinc-600 text-zinc-900 font-bold rounded-xl px-5 py-2.5 text-sm transition-all">Send</button>
        </div>
        <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
          {['Live scores','Group A','Top scorers','Schedule','Rankings','Help'].map(h=>(
            <button key={h} onClick={()=>setInput(h)} className="px-2.5 py-1 rounded-lg bg-[#1a1f2e] text-zinc-400 text-[10px] hover:bg-[#2a3146] transition-all whitespace-nowrap border border-[#2a3146]/50">{h}</button>
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
  const [tab,setTab] = useState('Home');
  const [loading,setLoading] = useState(true);
  useEffect(()=>{const t=setTimeout(()=>setLoading(false),800);return()=>clearTimeout(t);},[]);

  const tabs = ['Home','Standings','Schedule','Leaderboard','Chat'];
  const icons: Record<string,string> = {Home:'🏠',Standings:'📊',Schedule:'📅',Leaderboard:'🏆',Chat:'💬'};
  const liveCount = MATCHES.filter(m=>m.status==='live').length;

  if(loading) return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-5xl animate-bounce">⚽</div>
        <div className="text-amber-400 font-bold text-sm animate-pulse">Loading FIFA 2026...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0e17] text-zinc-100">
      <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20">
        {/* Tab Bar */}
        <div className="sticky top-0 z-50 bg-[#0a0e17]/95 backdrop-blur-md -mx-4 md:-mx-6 px-4 md:px-6 py-3 mb-5 border-b border-[#2a3146]/50">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${tab===t?'bg-amber-400 text-zinc-900 shadow-lg shadow-amber-400/20':'bg-[#1a1f2e] text-zinc-400 border border-[#2a3146] hover:border-amber-400/30'}`}>
                <span>{icons[t]}</span><span className="hidden sm:inline">{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {tab==='Home'&&<HomeTab/>}
        {tab==='Standings'&&<StandingsTab/>}
        {tab==='Schedule'&&<ScheduleTab/>}
        {tab==='Leaderboard'&&<LeaderboardTab/>}
        {tab==='Chat'&&<ChatTab/>}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0e17]/90 backdrop-blur-sm border-t border-[#2a3146]/50 py-2 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-zinc-600 text-[10px]">FIFA 2026 Tracker</span>
          {liveCount>0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
              <span className="text-red-400 text-[10px] font-bold">{liveCount} LIVE</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
