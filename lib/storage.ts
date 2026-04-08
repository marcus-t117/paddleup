import type { Player, Game, League, LeagueMembership } from '@/types';
import { STORAGE_KEYS, DATA_VERSION } from './constants';
import { generateSampleData } from './sample-data';

function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function isCurrentVersion(): boolean {
  return getItem<number>(STORAGE_KEYS.VERSION) === DATA_VERSION;
}

export function isInitialized(): boolean {
  return getItem<boolean>(STORAGE_KEYS.INITIALIZED) === true && isCurrentVersion();
}

export function initialize(): {
  players: Player[];
  games: Game[];
  userId: string;
  leagues: League[];
  memberships: LeagueMembership[];
} {
  if (isInitialized()) {
    return {
      players: getPlayers(),
      games: getGames(),
      userId: getUserId()!,
      leagues: getLeagues(),
      memberships: getLeagueMemberships(),
    };
  }

  // Clear old data on version mismatch
  resetAll();

  const { players, games, userId, leagues, memberships } = generateSampleData();
  setItem(STORAGE_KEYS.PLAYERS, players);
  setItem(STORAGE_KEYS.GAMES, games);
  setItem(STORAGE_KEYS.USER_ID, userId);
  setItem(STORAGE_KEYS.LEAGUES, leagues);
  setItem(STORAGE_KEYS.LEAGUE_MEMBERSHIPS, memberships);
  setItem(STORAGE_KEYS.ACTIVE_LEAGUE, leagues[0].id);
  setItem(STORAGE_KEYS.INITIALIZED, true);
  setItem(STORAGE_KEYS.VERSION, DATA_VERSION);

  return { players, games, userId, leagues, memberships };
}

// Players
export function getPlayers(): Player[] {
  return getItem<Player[]>(STORAGE_KEYS.PLAYERS) || [];
}

export function savePlayers(players: Player[]): void {
  setItem(STORAGE_KEYS.PLAYERS, players);
}

export function getPlayerById(id: string): Player | undefined {
  return getPlayers().find(p => p.id === id);
}

export function updatePlayer(updated: Player): void {
  const players = getPlayers();
  const idx = players.findIndex(p => p.id === updated.id);
  if (idx >= 0) {
    players[idx] = updated;
    savePlayers(players);
  }
}

export function addPlayer(player: Player): void {
  const players = getPlayers();
  players.push(player);
  savePlayers(players);
}

// Games
export function getGames(): Game[] {
  return getItem<Game[]>(STORAGE_KEYS.GAMES) || [];
}

export function saveGames(games: Game[]): void {
  setItem(STORAGE_KEYS.GAMES, games);
}

export function addGame(game: Game): void {
  const games = getGames();
  games.push(game);
  saveGames(games);
}

export function getGamesForLeague(leagueId: string): Game[] {
  return getGames().filter(g => g.leagueId === leagueId);
}

// User
export function getUserId(): string | null {
  return getItem<string>(STORAGE_KEYS.USER_ID);
}

// Leagues
export function getLeagues(): League[] {
  return getItem<League[]>(STORAGE_KEYS.LEAGUES) || [];
}

export function saveLeagues(leagues: League[]): void {
  setItem(STORAGE_KEYS.LEAGUES, leagues);
}

export function addLeague(league: League): void {
  const leagues = getLeagues();
  leagues.push(league);
  saveLeagues(leagues);
}

export function getActiveLeagueId(): string | null {
  return getItem<string>(STORAGE_KEYS.ACTIVE_LEAGUE);
}

export function setActiveLeagueId(id: string): void {
  setItem(STORAGE_KEYS.ACTIVE_LEAGUE, id);
}

// League Memberships
export function getLeagueMemberships(): LeagueMembership[] {
  return getItem<LeagueMembership[]>(STORAGE_KEYS.LEAGUE_MEMBERSHIPS) || [];
}

export function saveLeagueMemberships(memberships: LeagueMembership[]): void {
  setItem(STORAGE_KEYS.LEAGUE_MEMBERSHIPS, memberships);
}

export function getMembershipsForLeague(leagueId: string): LeagueMembership[] {
  return getLeagueMemberships().filter(m => m.leagueId === leagueId);
}

export function getMembership(leagueId: string, playerId: string): LeagueMembership | undefined {
  return getLeagueMemberships().find(m => m.leagueId === leagueId && m.playerId === playerId);
}

export function upsertMembership(membership: LeagueMembership): void {
  const all = getLeagueMemberships();
  const idx = all.findIndex(m => m.leagueId === membership.leagueId && m.playerId === membership.playerId);
  if (idx >= 0) {
    all[idx] = membership;
  } else {
    all.push(membership);
  }
  saveLeagueMemberships(all);
}

// Reset
export function resetAll(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
