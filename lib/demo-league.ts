import type { Player, Game, League, LeagueMembership } from '@/types';

// Fixed demo league — same data for every user on every device.
// IDs are stable strings so the data is never re-generated or duplicated.

export const DEMO_LEAGUE_ID = 'demo-league';

const D = '2026-01-01T00:00:00.000Z'; // arbitrary fixed createdAt

export const DEMO_LEAGUE: League = {
  id: DEMO_LEAGUE_ID,
  name: 'Elite Division (Demo)',
  createdAt: D,
  isDefault: false,
  memberIds: ['dp1','dp2','dp3','dp4','dp5','dp6','dp7','dp8','dp9'],
};

export const DEMO_PLAYERS: Player[] = [
  { id:'dp1', name:'Alex',         elo:3150, eloHistory:[], wins:45, losses:12, currentStreak:3,  bestStreak:8,  gamesPlayed:57, badges:['flash-serve','hot-streak','season-vet','atp-master','court-dominator','inferno'], xp:3705, level:19, recentForm:['W','W','W','L','W'], createdAt:D, isUser:false },
  { id:'dp2', name:'Lily',         elo:2840, eloHistory:[], wins:38, losses:18, currentStreak:-1, bestStreak:6,  gamesPlayed:56, badges:['flash-serve','hot-streak','season-vet','atp-master','court-dominator','inferno'], xp:3640, level:19, recentForm:['L','W','W','W','L'], createdAt:D, isUser:false },
  { id:'dp3', name:'Darrich',      elo:2710, eloHistory:[], wins:35, losses:20, currentStreak:2,  bestStreak:5,  gamesPlayed:55, badges:['flash-serve','hot-streak','season-vet','atp-master','inferno'],                  xp:3575, level:18, recentForm:['W','W','L','W','W'], createdAt:D, isUser:false },
  { id:'dp4', name:'Alfonso',      elo:2650, eloHistory:[], wins:30, losses:15, currentStreak:3,  bestStreak:7,  gamesPlayed:45, badges:['flash-serve','hot-streak','season-vet','atp-master'],                           xp:2925, level:15, recentForm:['W','W','W','L','W'], createdAt:D, isUser:false },
  { id:'dp5', name:'Ting',         elo:2580, eloHistory:[], wins:28, losses:14, currentStreak:4,  bestStreak:4,  gamesPlayed:42, badges:['flash-serve','hot-streak','season-vet','atp-master'],                           xp:2730, level:14, recentForm:['L','W','W','W','W'], createdAt:D, isUser:false },
  { id:'dp6', name:'Jules Navarro',elo:2410, eloHistory:[], wins:25, losses:20, currentStreak:-2, bestStreak:5,  gamesPlayed:45, badges:['flash-serve','hot-streak','season-vet'],                                        xp:2925, level:15, recentForm:['W','L','L','W','L'], createdAt:D, isUser:false },
  { id:'dp7', name:'Mei-Lin Wu',   elo:2395, eloHistory:[], wins:32, losses:10, currentStreak:5,  bestStreak:9,  gamesPlayed:42, badges:['flash-serve','hot-streak','season-vet','perfect-week'],                         xp:2730, level:14, recentForm:['W','W','W','W','W'], createdAt:D, isUser:false },
  { id:'dp8', name:'Coach Rick',   elo:1945, eloHistory:[], wins:22, losses:18, currentStreak:2,  bestStreak:4,  gamesPlayed:40, badges:['flash-serve','hot-streak','season-vet'],                                        xp:2600, level:13, recentForm:['W','W','L','W','L'], createdAt:D, isUser:false },
  { id:'dp9', name:'Sam Okoro',    elo:1200, eloHistory:[], wins:8,  losses:12, currentStreak:-1, bestStreak:3,  gamesPlayed:20, badges:['flash-serve'],                                                                   xp:1300, level:7,  recentForm:['L','W','L','W','L'], createdAt:D, isUser:false },
];

export const DEMO_MEMBERSHIPS: LeagueMembership[] = DEMO_PLAYERS.map(p => ({
  leagueId: DEMO_LEAGUE_ID,
  playerId: p.id,
  elo: p.elo,
  eloHistory: p.eloHistory,
  wins: p.wins,
  losses: p.losses,
  currentStreak: p.currentStreak,
  bestStreak: p.bestStreak,
  gamesPlayed: p.gamesPlayed,
  xp: p.xp,
  level: p.level,
  recentForm: p.recentForm,
  badges: p.badges,
}));

// Fixed sample games between demo players
export const DEMO_GAMES: Game[] = [
  { id:'dg1',  date:'2026-03-01T10:00:00.000Z', type:'singles', leagueId:DEMO_LEAGUE_ID, playerIds:['dp1'], opponentIds:['dp2'], playerScore:11, opponentScore:7,  winner:'player',   eloChanges:{dp1:18,dp2:-18}, createdAt:'2026-03-01T10:00:00.000Z' },
  { id:'dg2',  date:'2026-03-03T10:00:00.000Z', type:'singles', leagueId:DEMO_LEAGUE_ID, playerIds:['dp2'], opponentIds:['dp3'], playerScore:11, opponentScore:9,  winner:'player',   eloChanges:{dp2:15,dp3:-15}, createdAt:'2026-03-03T10:00:00.000Z' },
  { id:'dg3',  date:'2026-03-05T10:00:00.000Z', type:'singles', leagueId:DEMO_LEAGUE_ID, playerIds:['dp3'], opponentIds:['dp4'], playerScore:11, opponentScore:5,  winner:'player',   eloChanges:{dp3:12,dp4:-12}, createdAt:'2026-03-05T10:00:00.000Z' },
  { id:'dg4',  date:'2026-03-07T10:00:00.000Z', type:'singles', leagueId:DEMO_LEAGUE_ID, playerIds:['dp4'], opponentIds:['dp5'], playerScore:8,  opponentScore:11, winner:'opponent', eloChanges:{dp4:-14,dp5:14}, createdAt:'2026-03-07T10:00:00.000Z' },
  { id:'dg5',  date:'2026-03-09T10:00:00.000Z', type:'singles', leagueId:DEMO_LEAGUE_ID, playerIds:['dp1'], opponentIds:['dp3'], playerScore:11, opponentScore:4,  winner:'player',   eloChanges:{dp1:22,dp3:-22}, createdAt:'2026-03-09T10:00:00.000Z' },
  { id:'dg6',  date:'2026-03-11T10:00:00.000Z', type:'singles', leagueId:DEMO_LEAGUE_ID, playerIds:['dp7'], opponentIds:['dp6'], playerScore:11, opponentScore:8,  winner:'player',   eloChanges:{dp7:16,dp6:-16}, createdAt:'2026-03-11T10:00:00.000Z' },
  { id:'dg7',  date:'2026-03-13T10:00:00.000Z', type:'doubles', leagueId:DEMO_LEAGUE_ID, playerIds:['dp1','dp5'], opponentIds:['dp2','dp3'], playerScore:11, opponentScore:9, winner:'player', eloChanges:{dp1:12,dp5:12,dp2:-12,dp3:-12}, createdAt:'2026-03-13T10:00:00.000Z' },
  { id:'dg8',  date:'2026-03-15T10:00:00.000Z', type:'singles', leagueId:DEMO_LEAGUE_ID, playerIds:['dp8'], opponentIds:['dp9'], playerScore:11, opponentScore:3,  winner:'player',   eloChanges:{dp8:10,dp9:-10}, createdAt:'2026-03-15T10:00:00.000Z' },
  { id:'dg9',  date:'2026-03-17T10:00:00.000Z', type:'singles', leagueId:DEMO_LEAGUE_ID, playerIds:['dp6'], opponentIds:['dp8'], playerScore:9,  opponentScore:11, winner:'opponent', eloChanges:{dp6:-11,dp8:11}, createdAt:'2026-03-17T10:00:00.000Z' },
  { id:'dg10', date:'2026-03-19T10:00:00.000Z', type:'singles', leagueId:DEMO_LEAGUE_ID, playerIds:['dp2'], opponentIds:['dp1'], playerScore:7,  opponentScore:11, winner:'opponent', eloChanges:{dp2:-19,dp1:19}, createdAt:'2026-03-19T10:00:00.000Z' },
];
