import type { Player, Game, EloSnapshot } from '@/types';
import { generateId } from './utils';
import { STARTING_ELO } from './constants';

interface SamplePlayer {
  name: string;
  elo: number;
  wins: number;
  losses: number;
  streak: number;
  form: ('W' | 'L')[];
}

const SAMPLE_PLAYERS: SamplePlayer[] = [
  { name: 'Marcus V.', elo: 3150, wins: 45, losses: 12, streak: 3, form: ['W', 'W', 'W', 'L', 'W'] },
  { name: 'Sarah K.', elo: 2840, wins: 38, losses: 18, streak: -1, form: ['L', 'W', 'W', 'W', 'L'] },
  { name: 'Elena G.', elo: 2710, wins: 35, losses: 20, streak: 2, form: ['W', 'W', 'L', 'W', 'W'] },
  { name: 'Jordan Miller', elo: 2650, wins: 30, losses: 15, streak: 3, form: ['W', 'W', 'W', 'L', 'W'] },
  { name: 'Clara Smith', elo: 2580, wins: 28, losses: 14, streak: 4, form: ['L', 'W', 'W', 'W', 'W'] },
  { name: 'Thomas Reed', elo: 2410, wins: 25, losses: 20, streak: -2, form: ['W', 'L', 'L', 'W', 'L'] },
  { name: 'Zoe Chen', elo: 2395, wins: 32, losses: 10, streak: 5, form: ['W', 'W', 'W', 'W', 'W'] },
  { name: 'Coach Rick', elo: 1945, wins: 22, losses: 18, streak: 2, form: ['W', 'W', 'L', 'W', 'L'] },
  { name: 'Priya M.', elo: 1200, wins: 8, losses: 12, streak: -1, form: ['L', 'W', 'L', 'W', 'L'] },
];

function generateEloHistory(currentElo: number, gamesPlayed: number): EloSnapshot[] {
  const history: EloSnapshot[] = [];
  const numPoints = Math.min(gamesPlayed, 20);
  let elo = currentElo - Math.floor(Math.random() * 400) - 200; // start lower

  for (let i = 0; i < numPoints; i++) {
    const daysAgo = numPoints - i;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo * 2);

    // Trend upward with some variance
    const delta = Math.floor(Math.random() * 60) - 15;
    elo = Math.max(800, elo + delta);

    // Last point should be close to current
    if (i === numPoints - 1) elo = currentElo;

    history.push({
      date: date.toISOString(),
      elo,
      gameId: generateId(),
    });
  }

  return history;
}

function generateSampleGames(players: Player[]): Game[] {
  const games: Game[] = [];
  const venues = ['Sunset Courts', 'Central Park', 'Downtown Plaza', 'Riverside Club', 'Grand Central Courts'];

  // Generate some recent games for the sample players
  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 10) + 9, Math.floor(Math.random() * 60));

    // Pick two random non-user players
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

export function generateSampleData(): { players: Player[]; games: Game[]; userId: string } {
  const userId = generateId();

  // Create the user player
  const userPlayer: Player = {
    id: userId,
    name: 'Marcus T.',
    elo: STARTING_ELO,
    eloHistory: [{
      date: new Date().toISOString(),
      elo: STARTING_ELO,
      gameId: 'initial',
    }],
    wins: 0,
    losses: 0,
    currentStreak: 0,
    bestStreak: 0,
    gamesPlayed: 0,
    badges: [],
    xp: 0,
    level: 1,
    recentForm: [],
    createdAt: new Date().toISOString(),
    isUser: true,
  };

  // Create sample players
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

  const allPlayers = [userPlayer, ...samplePlayers];
  const games = generateSampleGames(allPlayers);

  return { players: allPlayers, games, userId };
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
