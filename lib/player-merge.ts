import type { LeagueMembership } from '@/types';
import {
  getPlayers, savePlayers,
  getGames, saveGames,
  getLeagues, saveLeagues,
  getLeagueMemberships, saveLeagueMemberships,
} from './storage';
import { SHARED_LEAGUES } from './constants';
import { pushShared } from './sync';

/**
 * Merge all game records and league memberships from one player into another.
 * The "from" player is removed; the "to" player absorbs their games and stats.
 * Returns a result message.
 */
export function mergePlayers(fromName: string, toName: string): string {
  const players = getPlayers();

  const fromPlayer = players.find(p => p.name.toLowerCase() === fromName.trim().toLowerCase());
  const toPlayer   = players.find(p => p.name.toLowerCase() === toName.trim().toLowerCase());

  if (!fromPlayer) return `Player "${fromName}" not found.`;
  if (!toPlayer)   return `Player "${toName}" not found.`;
  if (fromPlayer.id === toPlayer.id) return 'Both names resolve to the same player — nothing to merge.';

  const fromId = fromPlayer.id;
  const toId   = toPlayer.id;

  // --- Games: replace fromId with toId throughout ---
  const games = getGames();
  const updatedGames = games.map(g => ({
    ...g,
    playerIds:   g.playerIds.map(id   => id === fromId ? toId : id),
    opponentIds: g.opponentIds.map(id => id === fromId ? toId : id),
    eloChanges:  Object.fromEntries(
      Object.entries(g.eloChanges).map(([k, v]) => [k === fromId ? toId : k, v])
    ),
  }));
  saveGames(updatedGames);

  // --- Memberships: combine per-league ---
  const allMemberships = getLeagueMemberships();
  const fromMs  = allMemberships.filter(m => m.playerId === fromId);
  const toMs    = allMemberships.filter(m => m.playerId === toId);
  const otherMs = allMemberships.filter(m => m.playerId !== fromId && m.playerId !== toId);

  const mergedToMs: LeagueMembership[] = [...toMs];

  for (const fromM of fromMs) {
    const toMIdx = mergedToMs.findIndex(m => m.leagueId === fromM.leagueId);
    if (toMIdx < 0) {
      // toPlayer has no membership in this league — reassign fromPlayer's membership
      mergedToMs.push({ ...fromM, playerId: toId });
    } else {
      // Both have memberships — combine stats, keep toPlayer's current ELO
      const toM = mergedToMs[toMIdx];
      const combinedEloHistory = [...fromM.eloHistory, ...toM.eloHistory]
        .sort((a, b) => a.date.localeCompare(b.date));

      mergedToMs[toMIdx] = {
        ...toM,
        wins:         toM.wins   + fromM.wins,
        losses:       toM.losses + fromM.losses,
        gamesPlayed:  toM.gamesPlayed + fromM.gamesPlayed,
        bestStreak:   Math.max(toM.bestStreak, fromM.bestStreak),
        xp:           toM.xp + fromM.xp,
        eloHistory:   combinedEloHistory,
        recentForm:   [...fromM.recentForm, ...toM.recentForm].slice(-5) as ('W' | 'L')[],
      };
    }
  }

  saveLeagueMemberships([...otherMs, ...mergedToMs]);

  // --- Leagues: remove fromId from memberIds ---
  const leagues = getLeagues();
  const updatedLeagues = leagues.map(l => {
    if (!l.memberIds.includes(fromId)) return l;
    return {
      ...l,
      memberIds: l.memberIds.filter(id => id !== fromId),
    };
  });
  saveLeagues(updatedLeagues);

  // --- Players: remove the from-player ---
  savePlayers(players.filter(p => p.id !== fromId));

  // Push to any affected shared leagues immediately
  const affectedLeagueIds = new Set([
    ...fromMs.map(m => m.leagueId),
    ...toMs.map(m => m.leagueId),
  ]);
  for (const shared of SHARED_LEAGUES) {
    if (affectedLeagueIds.has(shared.id)) {
      pushShared(shared.id);
    }
  }

  return `Merged "${fromName}" into "${toName}". Page will reload to reflect changes.`;
}
