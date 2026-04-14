import type { Player, Game, League, LeagueMembership } from '@/types';
import { STORAGE_KEYS, isSharedLeagueId } from './constants';

export interface SharedSlice {
  league: League;
  memberships: LeagueMembership[];
  games: Game[];
  players: Player[];
}

export type PullResult =
  | { ok: true; slice: SharedSlice }
  | {
      ok: false;
      reason: 'timeout' | 'network' | 'not_found' | 'server' | 'bad_response';
      status?: number;
      detail?: string;
    };

function readJSON<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Build the slice for a shared league from localStorage.
function getSharedSlice(leagueId: string): SharedSlice | null {
  const leagues = readJSON<League[]>(STORAGE_KEYS.LEAGUES) || [];
  const league = leagues.find(l => l.id === leagueId);
  if (!league) return null;

  const allMemberships = readJSON<LeagueMembership[]>(STORAGE_KEYS.LEAGUE_MEMBERSHIPS) || [];
  const memberships = allMemberships.filter(m => m.leagueId === leagueId);

  const allGames = readJSON<Game[]>(STORAGE_KEYS.GAMES) || [];
  const games = allGames.filter(g => g.leagueId === leagueId);

  const referencedPlayerIds = new Set<string>();
  for (const m of memberships) referencedPlayerIds.add(m.playerId);
  for (const g of games) {
    for (const id of g.playerIds) referencedPlayerIds.add(id);
    for (const id of g.opponentIds) referencedPlayerIds.add(id);
  }
  for (const id of league.memberIds) referencedPlayerIds.add(id);

  const allPlayers = readJSON<Player[]>(STORAGE_KEYS.PLAYERS) || [];
  const players = allPlayers.filter(p => referencedPlayerIds.has(p.id));

  return { league, memberships, games, players };
}

// Push the shared league's slice to the server. Fire-and-forget.
export function pushShared(leagueId: string): void {
  if (typeof window === 'undefined') return;
  if (!isSharedLeagueId(leagueId)) return;

  const slice = getSharedSlice(leagueId);
  if (!slice) return;

  fetch('/api/sync', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: leagueId, data: slice }),
  }).catch(err => {
    console.warn('[paddleup shared] push failed', leagueId, err);
  });
}

// Pull the shared league's slice from the server. Returns a discriminated result.
export async function pullShared(leagueId: string): Promise<PullResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  let res: Response;
  try {
    res = await fetch(`/api/sync?code=${encodeURIComponent(leagueId)}`, {
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const reason = err instanceof DOMException && err.name === 'AbortError' ? 'timeout' : 'network';
    const detail = err instanceof Error ? err.message : String(err);
    console.warn('[paddleup shared] pull failed', leagueId, reason, detail);
    return { ok: false, reason, detail };
  }
  clearTimeout(timeoutId);

  const bodyText = await res.text().catch(() => '');

  if (!res.ok) {
    const reason: 'not_found' | 'server' = res.status === 404 ? 'not_found' : 'server';
    if (reason !== 'not_found') {
      console.warn('[paddleup shared] pull failed', leagueId, reason, res.status, bodyText);
    }
    return { ok: false, reason, status: res.status, detail: bodyText };
  }

  let slice: unknown;
  try {
    slice = JSON.parse(bodyText);
  } catch {
    console.warn('[paddleup shared] pull failed', leagueId, 'bad_response', bodyText.slice(0, 200));
    return { ok: false, reason: 'bad_response', status: res.status, detail: 'Non-JSON response' };
  }

  if (!isSharedSlice(slice)) {
    console.warn('[paddleup shared] pull failed', leagueId, 'bad_response', 'unexpected shape');
    return { ok: false, reason: 'bad_response', status: res.status, detail: 'Unexpected slice shape' };
  }

  return { ok: true, slice };
}

function isSharedSlice(v: unknown): v is SharedSlice {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return (
    !!s.league &&
    typeof s.league === 'object' &&
    Array.isArray(s.memberships) &&
    Array.isArray(s.games) &&
    Array.isArray(s.players)
  );
}

// Merge a server slice into localStorage using union-with-server-wins semantics.
// Returns true if anything changed.
export function mergeSharedSlice(slice: SharedSlice): boolean {
  if (typeof window === 'undefined') return false;
  const leagueId = slice.league.id;

  // Leagues: replace row, union memberIds
  const leagues = readJSON<League[]>(STORAGE_KEYS.LEAGUES) || [];
  const idx = leagues.findIndex(l => l.id === leagueId);
  const mergedMemberIds = Array.from(
    new Set([...(idx >= 0 ? leagues[idx].memberIds : []), ...slice.league.memberIds])
  );
  const mergedLeague: League = { ...slice.league, memberIds: mergedMemberIds };
  if (idx >= 0) leagues[idx] = mergedLeague;
  else leagues.push(mergedLeague);
  writeJSON(STORAGE_KEYS.LEAGUES, leagues);

  // Memberships: union by (leagueId, playerId), server wins on conflict for this leagueId
  const allMemberships = readJSON<LeagueMembership[]>(STORAGE_KEYS.LEAGUE_MEMBERSHIPS) || [];
  const serverKeys = new Set(slice.memberships.map(m => `${m.leagueId}:${m.playerId}`));
  const filtered = allMemberships.filter(
    m => m.leagueId !== leagueId || !serverKeys.has(`${m.leagueId}:${m.playerId}`)
  );
  writeJSON(STORAGE_KEYS.LEAGUE_MEMBERSHIPS, [...filtered, ...slice.memberships]);

  // Games: union by id, server wins on conflict
  const allGames = readJSON<Game[]>(STORAGE_KEYS.GAMES) || [];
  const serverGameIds = new Set(slice.games.map(g => g.id));
  const keptGames = allGames.filter(g => !serverGameIds.has(g.id));
  writeJSON(STORAGE_KEYS.GAMES, [...keptGames, ...slice.games]);

  // Players: union by id, server wins on conflict
  const allPlayers = readJSON<Player[]>(STORAGE_KEYS.PLAYERS) || [];
  const serverPlayerIds = new Set(slice.players.map(p => p.id));
  const keptPlayers = allPlayers.filter(p => !serverPlayerIds.has(p.id));
  writeJSON(STORAGE_KEYS.PLAYERS, [...keptPlayers, ...slice.players]);

  return true;
}
