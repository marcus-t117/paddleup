import type { Player, Game, League, LeagueMembership } from '@/types';
import { STORAGE_KEYS, DATA_VERSION, STARTING_ELO, SHARED_LEAGUES } from './constants';
import { generateSampleData } from './sample-data';
import { pushShared, mergeSharedSlice, type SharedSlice } from './sync';
import { DEMO_LEAGUE_ID, DEMO_LEAGUE, DEMO_PLAYERS, DEMO_MEMBERSHIPS, DEMO_GAMES } from './demo-league';

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
  scheduleSync();
}

// Debounced sync — batches rapid writes into a single server push per shared league
let syncTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSync(): void {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    const leagues = getLeagues();
    for (const shared of SHARED_LEAGUES) {
      if (leagues.some(l => l.id === shared.id)) {
        pushShared(shared.id);
      }
    }
    syncTimer = null;
  }, 1000);
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
  userId: string | null;
  leagues: League[];
  memberships: LeagueMembership[];
} {
  if (isInitialized()) {
    ensureSharedLeaguePlaceholders();
    ensureDemoLeague();
    return {
      players: getPlayers(),
      games: getGames(),
      userId: getUserId(),
      leagues: getLeagues(),
      memberships: getLeagueMemberships(),
    };
  }

  // Not initialised: clear stale data and return empty state
  // The setup screen will call initializeWithSetup() to populate
  resetAll();

  return { players: [], games: [], userId: null, leagues: [], memberships: [] };
}

export function initializeWithSetup(userName: string, leagueName: string): {
  players: Player[];
  games: Game[];
  userId: string;
  leagues: League[];
  memberships: LeagueMembership[];
} {
  resetAll();

  const userId = crypto.randomUUID();
  const userLeagueId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Create user player
  const userPlayer: Player = {
    id: userId,
    name: userName,
    elo: STARTING_ELO,
    eloHistory: [{ date: now, elo: STARTING_ELO, gameId: 'initial' }],
    wins: 0, losses: 0, currentStreak: 0, bestStreak: 0, gamesPlayed: 0,
    badges: [], xp: 0, level: 1, recentForm: [],
    createdAt: now,
    isUser: true,
  };

  // Generate demo league with sample data
  const demo = generateSampleData();
  // Mark demo league as non-default
  demo.leagues[0].isDefault = false;
  demo.leagues[0].name = 'Demo League';

  // Replace the demo user with our real user (keep them in the demo league too)
  const demoUserId = demo.userId;
  // Remove the demo user player, add real user
  const demoPlayers = demo.players.filter(p => !p.isUser);
  // Add user to demo league members
  demo.leagues[0].memberIds = demo.leagues[0].memberIds
    .filter(id => id !== demoUserId)
    .concat(userId);
  // Fix game references from demo userId to real userId
  const demoGames = demo.games.map(g => ({
    ...g,
    playerIds: g.playerIds.map(id => id === demoUserId ? userId : id),
    opponentIds: g.opponentIds.map(id => id === demoUserId ? userId : id),
    eloChanges: Object.fromEntries(
      Object.entries(g.eloChanges).map(([k, v]) => [k === demoUserId ? userId : k, v])
    ),
  }));
  // Fix demo memberships
  const demoMemberships = demo.memberships.map(m =>
    m.playerId === demoUserId ? { ...m, playerId: userId } : m
  );

  // Create user's real league
  const userLeague: League = {
    id: userLeagueId,
    name: leagueName,
    createdAt: now,
    isDefault: true,
    memberIds: [userId],
  };

  // User membership in their real league (fresh)
  const userMembership: LeagueMembership = {
    leagueId: userLeagueId,
    playerId: userId,
    elo: STARTING_ELO,
    eloHistory: [{ date: now, elo: STARTING_ELO, gameId: 'initial' }],
    wins: 0, losses: 0, currentStreak: 0, bestStreak: 0, gamesPlayed: 0,
    xp: 0, level: 1, recentForm: [], badges: [],
  };

  const allPlayers = [userPlayer, ...demoPlayers];
  const allLeagues = [userLeague, ...demo.leagues];
  const allMemberships = [userMembership, ...demoMemberships];

  // Seed placeholder entries for each shared league. Boot-pull merges with server state.
  for (const shared of SHARED_LEAGUES) {
    if (!allLeagues.some(l => l.id === shared.id)) {
      allLeagues.push({
        id: shared.id,
        name: shared.name,
        createdAt: now,
        isDefault: false,
        memberIds: [userId],
      });
      allMemberships.push({
        leagueId: shared.id,
        playerId: userId,
        elo: STARTING_ELO,
        eloHistory: [{ date: now, elo: STARTING_ELO, gameId: 'initial' }],
        wins: 0,
        losses: 0,
        currentStreak: 0,
        bestStreak: 0,
        gamesPlayed: 0,
        xp: 0,
        level: 1,
        recentForm: [],
        badges: [],
      });
    }
  }

  setItem(STORAGE_KEYS.PLAYERS, allPlayers);
  setItem(STORAGE_KEYS.GAMES, demoGames);
  setItem(STORAGE_KEYS.USER_ID, userId);
  setItem(STORAGE_KEYS.LEAGUES, allLeagues);
  setItem(STORAGE_KEYS.LEAGUE_MEMBERSHIPS, allMemberships);
  setItem(STORAGE_KEYS.ACTIVE_LEAGUE, userLeagueId);
  setItem(STORAGE_KEYS.INITIALIZED, true);
  setItem(STORAGE_KEYS.VERSION, DATA_VERSION);

  return { players: allPlayers, games: demoGames, userId, leagues: allLeagues, memberships: allMemberships };
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

// Inject demo league data if not already present. Idempotent — safe to call on every boot.
function ensureDemoLeague(): void {
  const leagues = getLeagues();
  if (leagues.some(l => l.id === DEMO_LEAGUE_ID)) return;

  const players = getPlayers();
  const memberships = getLeagueMemberships();
  const games = getGames();

  const newPlayerIds = new Set(players.map(p => p.id));
  const newPlayers = DEMO_PLAYERS.filter(p => !newPlayerIds.has(p.id));

  setItem(STORAGE_KEYS.LEAGUES, [...leagues, DEMO_LEAGUE]);
  setItem(STORAGE_KEYS.PLAYERS, [...players, ...newPlayers]);
  setItem(STORAGE_KEYS.LEAGUE_MEMBERSHIPS, [...memberships, ...DEMO_MEMBERSHIPS]);

  const existingGameIds = new Set(games.map(g => g.id));
  const newGames = DEMO_GAMES.filter(g => !existingGameIds.has(g.id));
  setItem(STORAGE_KEYS.GAMES, [...games, ...newGames]);
}

// Claim an existing player from a shared league as the current user.
// Used when someone selects their name on the setup screen instead of creating new.
export function claimExistingUser(playerId: string, slice: SharedSlice): void {
  resetAll();
  mergeSharedSlice(slice);

  // Mark only the claimed player as isUser
  const players = getPlayers().map(p => ({ ...p, isUser: p.id === playerId }));
  setItem(STORAGE_KEYS.PLAYERS, players);

  setItem(STORAGE_KEYS.USER_ID, playerId);
  setItem(STORAGE_KEYS.ACTIVE_LEAGUE, slice.league.id);
  setItem(STORAGE_KEYS.INITIALIZED, true);
  setItem(STORAGE_KEYS.VERSION, DATA_VERSION);
  ensureDemoLeague();
}

// Reset
export function resetAll(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}

// Ensure each shared league has a placeholder entry + user membership.
// Idempotent; safe to call on every boot for already-initialised users.
function ensureSharedLeaguePlaceholders(): void {
  const userId = getUserId();
  if (!userId) return;

  const leagues = getLeagues();
  const memberships = getLeagueMemberships();
  const now = new Date().toISOString();
  let changed = false;

  for (const shared of SHARED_LEAGUES) {
    if (!leagues.some(l => l.id === shared.id)) {
      leagues.push({
        id: shared.id,
        name: shared.name,
        createdAt: now,
        isDefault: false,
        memberIds: [userId],
      });
      changed = true;
    }
    if (!memberships.some(m => m.leagueId === shared.id && m.playerId === userId)) {
      memberships.push({
        leagueId: shared.id,
        playerId: userId,
        elo: STARTING_ELO,
        eloHistory: [{ date: now, elo: STARTING_ELO, gameId: 'initial' }],
        wins: 0,
        losses: 0,
        currentStreak: 0,
        bestStreak: 0,
        gamesPlayed: 0,
        xp: 0,
        level: 1,
        recentForm: [],
        badges: [],
      });
      changed = true;
    }
  }

  if (changed) {
    saveLeagues(leagues);
    saveLeagueMemberships(memberships);
  }
}
