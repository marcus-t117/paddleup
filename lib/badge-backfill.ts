import type { Player } from '@/types';
import {
  getPlayers,
  getGames,
  getLeagueMemberships, saveLeagueMemberships,
} from './storage';
import { checkBadges } from './badges';
import { SHARED_LEAGUES } from './constants';
import { pushShared } from './sync';

/**
 * Re-evaluate every player's badges against current stats and full game history.
 * Awards any badge that the player qualifies for but doesn't already have.
 * Returns a count of newly awarded badges across all players and leagues.
 */
export function backfillBadges(): { totalAwarded: number; affectedPlayers: number; message: string } {
  const memberships = getLeagueMemberships();
  const allGames = getGames();
  const players = getPlayers();

  let totalAwarded = 0;
  const affectedPlayerIds = new Set<string>();
  const affectedLeagueIds = new Set<string>();

  const updated = memberships.map(m => {
    const player = players.find(p => p.id === m.playerId);
    if (!player) return m;

    const leagueGames = allGames.filter(g => g.leagueId === m.leagueId);
    const tempPlayer: Player = {
      id: m.playerId,
      name: player.name,
      elo: m.elo,
      eloHistory: m.eloHistory,
      wins: m.wins,
      losses: m.losses,
      currentStreak: m.currentStreak,
      bestStreak: m.bestStreak,
      gamesPlayed: m.gamesPlayed,
      badges: m.badges,
      xp: m.xp,
      level: m.level,
      recentForm: m.recentForm,
      createdAt: player.createdAt,
      isUser: false,
    };

    const newBadges = checkBadges(tempPlayer, leagueGames);
    if (newBadges.length === 0) return m;

    totalAwarded += newBadges.length;
    affectedPlayerIds.add(m.playerId);
    affectedLeagueIds.add(m.leagueId);
    return { ...m, badges: [...m.badges, ...newBadges] };
  });

  saveLeagueMemberships(updated);

  // Push affected shared leagues to Redis
  for (const shared of SHARED_LEAGUES) {
    if (affectedLeagueIds.has(shared.id)) {
      pushShared(shared.id);
    }
  }

  const message = totalAwarded === 0
    ? 'All badges already up to date — no new awards.'
    : `Awarded ${totalAwarded} badge${totalAwarded === 1 ? '' : 's'} across ${affectedPlayerIds.size} player${affectedPlayerIds.size === 1 ? '' : 's'}.`;

  return { totalAwarded, affectedPlayers: affectedPlayerIds.size, message };
}
