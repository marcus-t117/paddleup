import type { Player, Game, EloSnapshot, League, LeagueMembership } from '@/types';
import { generateId } from './utils';
import { STARTING_ELO, DEFAULT_LEAGUE_NAME } from './constants';

interface SamplePlayer {
  name: string;
  elo: number;
  wins: number;
  losses: number;
  streak: number;
  form: ('W' | 'L')[];
}

const SAMPLE_PLAYERS: SamplePlayer[] = [
  { name: 'Alex', elo: 3150, wins: 45, losses: 12, streak: 3, form: ['W', 'W', 'W', 'L', 'W'] },
  { name: 'Lily', elo: 2840, wins: 38, losses: 18, streak: -1, form: ['L', 'W', 'W', 'W', 'L'] },
  { name: 'Darrich', elo: 2710, wins: 35, losses: 20, streak: 2, form: ['W', 'W', 'L', 'W', 'W'] },
  { name: 'Alfonso', elo: 2650, wins: 30, losses: 15, streak: 3, form: ['W', 'W', 'W', 'L', 'W'] },
  { name: 'Ting', elo: 2580, wins: 28, losses: 14, streak: 4, form: ['L', 'W', 'W', 'W', 'W'] },
  { name: 'Jules Navarro', elo: 2410, wins: 25, losses: 20, streak: -2, form: ['W', 'L', 'L', 'W', 'L'] },
  { name: 'Mei-Lin Wu', elo: 2395, wins: 32, losses: 10, streak: 5, form: ['W', 'W', 'W', 'W', 'W'] },
  { name: 'Coach Rick', elo: 1945, wins: 22, losses: 18, streak: 2, form: ['W', 'W', 'L', 'W', 'L'] },
  { name: 'Sam Okoro', elo: 1200, wins: 8, losses: 12, streak: -1, form: ['L', 'W', 'L', 'W', 'L'] },
];

function generateEloHistory(currentElo: number, gamesPlayed: number): EloSnapshot[] {
  const history: EloSnapshot[] = [];
  const numPoints = Math.min(gamesPlayed, 20);
  let elo = currentElo - Math.floor(Math.random() * 400) - 200;

  for (let i = 0; i < numPoints; i++) {
    const daysAgo = numPoints - i;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo * 2);
    const delta = Math.floor(Math.random() * 60) - 15;
    elo = Math.max(800, elo + delta);
    if (i === numPoints - 1) elo = currentElo;
    history.push({ date: date.toISOString(), elo, gameId: generateId() });
  }
  return history;
}

function generateSampleGames(players: Player[], leagueId: string): Game[] {
  const games: Game[] = [];
  const venues = ['Sunset Courts', 'Central Park', 'Downtown Plaza', 'Riverside Club', 'Grand Central Courts'];

  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 10) + 9, Math.floor(Math.random() * 60));

    const nonUserPlayers = players.filter(p => !p.isUser);
    const p1Idx = Math.floor(Math.random() * nonUserPlayers.length);
    let p2Idx = Math.floor(Math.random() * nonUserPlayers.length);
    while (p2Idx === p1Idx) p2Idx = Math.floor(Math.random() * nonUserPlayers.length);

    const p1 = nonUserPlayers[p1Idx];
    const p2 = nonUserPlayers[p2Idx];
    const p1Wins = Math.random() > 0.4;
    const winnerScore = 11;
    const loserScore = Math.floor(Math.random() * 8) + 2;

    games.push({
      id: generateId(),
      date: date.toISOString(),
      type: 'singles',
      leagueId,
      playerIds: [p1.id],
      opponentIds: [p2.id],
      playerScore: p1Wins ? winnerScore : loserScore,
      opponentScore: p1Wins ? loserScore : winnerScore,
      winner: p1Wins ? 'player' : 'opponent',
      eloChanges: {
        [p1.id]: p1Wins ? Math.floor(Math.random() * 20) + 5 : -(Math.floor(Math.random() * 20) + 5),
        [p2.id]: p1Wins ? -(Math.floor(Math.random() * 20) + 5) : Math.floor(Math.random() * 20) + 5,
      },
      venue: venues[Math.floor(Math.random() * venues.length)],
      createdAt: date.toISOString(),
    });
  }
  return games.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function generateUserGames(userId: string, samplePlayers: Player[], leagueId: string): Game[] {
  const venues = ['Sunset Courts', 'Central Park', 'Downtown Plaza', 'Riverside Club', 'Grand Central Courts'];
  const games: Game[] = [];

  const matchups: { oppIdx: number; won: boolean; myScore: number; oppScore: number; daysAgo: number }[] = [
    { oppIdx: 8, won: true,  myScore: 11, oppScore: 4,  daysAgo: 21 },
    { oppIdx: 7, won: false, myScore: 8,  oppScore: 11, daysAgo: 18 },
    { oppIdx: 8, won: true,  myScore: 11, oppScore: 7,  daysAgo: 16 },
    { oppIdx: 7, won: true,  myScore: 11, oppScore: 9,  daysAgo: 14 },
    { oppIdx: 5, won: false, myScore: 6,  oppScore: 11, daysAgo: 12 },
    { oppIdx: 8, won: true,  myScore: 11, oppScore: 3,  daysAgo: 10 },
    { oppIdx: 7, won: true,  myScore: 11, oppScore: 8,  daysAgo: 8 },
    { oppIdx: 4, won: false, myScore: 9,  oppScore: 11, daysAgo: 6 },
    { oppIdx: 7, won: true,  myScore: 11, oppScore: 5,  daysAgo: 5 },
    { oppIdx: 5, won: true,  myScore: 11, oppScore: 10, daysAgo: 3 },
    { oppIdx: 3, won: false, myScore: 7,  oppScore: 11, daysAgo: 2 },
    { oppIdx: 7, won: true,  myScore: 11, oppScore: 6,  daysAgo: 0 },
  ];

  let runningElo = STARTING_ELO;

  for (const m of matchups) {
    const opp = samplePlayers[m.oppIdx];
    const date = new Date();
    date.setDate(date.getDate() - m.daysAgo);
    date.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));

    const expected = 1 / (1 + Math.pow(10, (opp.elo - runningElo) / 400));
    const K = games.length < 20 ? 32 : 16;
    const delta = Math.round(K * ((m.won ? 1 : 0) - expected));
    runningElo = Math.max(0, runningElo + delta);

    games.push({
      id: generateId(),
      date: date.toISOString(),
      type: 'singles',
      leagueId,
      playerIds: [userId],
      opponentIds: [opp.id],
      playerScore: m.myScore,
      opponentScore: m.oppScore,
      winner: m.won ? 'player' : 'opponent',
      eloChanges: { [userId]: delta, [opp.id]: -delta },
      venue: venues[Math.floor(Math.random() * venues.length)],
      createdAt: date.toISOString(),
    });
  }
  return games;
}

function generateRandomBadges(elo: number, games: number): string[] {
  const badges: string[] = [];
  if (games >= 1) badges.push('flash-serve');
  if (games >= 10) badges.push('hot-streak');
  if (games >= 20) badges.push('season-vet');
  if (elo >= 1500) badges.push('atp-master');
  if (elo >= 2000) badges.push('court-dominator');
  if (games >= 30) badges.push('inferno');
  if (Math.random() > 0.5) badges.push('perfect-week');
  if (Math.random() > 0.6) badges.push('giant-killer');
  return badges;
}

export function generateSampleData(): {
  players: Player[];
  games: Game[];
  userId: string;
  leagues: League[];
  memberships: LeagueMembership[];
} {
  const userId = generateId();
  const defaultLeagueId = generateId();

  // Create sample players (identity only, stats go to memberships)
  const samplePlayers: Player[] = SAMPLE_PLAYERS.map(sp => ({
    id: generateId(),
    name: sp.name,
    elo: sp.elo,
    eloHistory: generateEloHistory(sp.elo, sp.wins + sp.losses),
    wins: sp.wins,
    losses: sp.losses,
    currentStreak: sp.streak,
    bestStreak: Math.max(sp.streak, Math.floor(Math.random() * 5) + 3),
    gamesPlayed: sp.wins + sp.losses,
    badges: generateRandomBadges(sp.elo, sp.wins + sp.losses),
    xp: (sp.wins + sp.losses) * 65,
    level: Math.floor(((sp.wins + sp.losses) * 65) / 200) + 1,
    recentForm: sp.form,
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    isUser: false,
  }));

  // Pre-seed user games
  const userGames = generateUserGames(userId, samplePlayers, defaultLeagueId);
  const userWins = userGames.filter(g => g.winner === 'player').length;
  const userLosses = userGames.length - userWins;
  const userForm = userGames.slice(-5).map(g => g.winner === 'player' ? 'W' as const : 'L' as const);

  let userStreak = 0;
  for (let i = userGames.length - 1; i >= 0; i--) {
    const won = userGames[i].winner === 'player';
    if (i === userGames.length - 1) {
      userStreak = won ? 1 : -1;
    } else if ((won && userStreak > 0) || (!won && userStreak < 0)) {
      userStreak += won ? 1 : -1;
    } else {
      break;
    }
  }

  let userElo = STARTING_ELO;
  const userEloHistory: EloSnapshot[] = [{ date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), elo: STARTING_ELO, gameId: 'initial' }];
  for (const game of userGames) {
    userElo += game.eloChanges[userId] || 0;
    userElo = Math.max(0, userElo);
    userEloHistory.push({ date: game.date, elo: userElo, gameId: game.id });
  }

  const userXp = userGames.length * 50 + userWins * 30 + Math.max(0, userStreak) * 15;
  const userBadges: string[] = [];
  if (userWins >= 1) userBadges.push('flash-serve');
  if (userStreak >= 3 || userGames.length >= 5) userBadges.push('hot-streak');
  if (userWins >= 5) userBadges.push('iron-defence');

  const userPlayer: Player = {
    id: userId,
    name: 'Marcus T.',
    elo: userElo,
    eloHistory: userEloHistory,
    wins: userWins,
    losses: userLosses,
    currentStreak: userStreak,
    bestStreak: Math.max(userStreak, 3),
    gamesPlayed: userGames.length,
    badges: userBadges,
    xp: userXp,
    level: Math.floor(userXp / 200) + 1,
    recentForm: userForm,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    isUser: true,
  };

  const allPlayers = [userPlayer, ...samplePlayers];

  // Create default league
  const defaultLeague: League = {
    id: defaultLeagueId,
    name: DEFAULT_LEAGUE_NAME,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    isDefault: true,
    memberIds: allPlayers.map(p => p.id),
  };

  // Create memberships from player stats
  const memberships: LeagueMembership[] = allPlayers.map(p => ({
    leagueId: defaultLeagueId,
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

  const otherGames = generateSampleGames(allPlayers, defaultLeagueId);
  const allGames = [...userGames, ...otherGames].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { players: allPlayers, games: allGames, userId, leagues: [defaultLeague], memberships };
}
