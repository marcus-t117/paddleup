import type { Player, Game } from '@/types';
import { STORAGE_KEYS } from './constants';
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

export function isInitialized(): boolean {
  return getItem<boolean>(STORAGE_KEYS.INITIALIZED) === true;
}

export function initialize(): { players: Player[]; games: Game[]; userId: string } {
  if (isInitialized()) {
    return {
      players: getPlayers(),
      games: getGames(),
      userId: getUserId()!,
    };
  }

  const { players, games, userId } = generateSampleData();
  setItem(STORAGE_KEYS.PLAYERS, players);
  setItem(STORAGE_KEYS.GAMES, games);
  setItem(STORAGE_KEYS.USER_ID, userId);
  setItem(STORAGE_KEYS.INITIALIZED, true);

  return { players, games, userId };
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

// User
export function getUserId(): string | null {
  return getItem<string>(STORAGE_KEYS.USER_ID);
}

// Reset
export function resetAll(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
