'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Game, Player } from '@/types';
import { getGames, saveGames, getLeagueMemberships, saveLeagueMemberships } from '@/lib/storage';
import { calculateEloChange, calculateDoublesEloChanges } from '@/lib/elo';
import { calculateXpEarned } from '@/lib/xp';
import { getLevel } from '@/lib/utils';
import { checkBadges } from '@/lib/badges';
import { useLeague } from '@/contexts/league-context';

interface LogGameInput {
  type: 'singles' | 'doubles';
  opponentName: string;
  opponent2Name?: string;
  partnerName?: string;
  playerScore: number;
  opponentScore: number;
  venue?: string;
}

export function useGames() {
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeLeagueId } = useLeague();

  useEffect(() => {
    setAllGames(getGames());
    setLoading(false);
  }, []);

  // Games scoped to active league
  const games = activeLeagueId
    ? allGames.filter(g => g.leagueId === activeLeagueId)
    : allGames;

  const logGame = useCallback((
    input: LogGameInput,
    userId: string,
    getOrCreatePlayer: (name: string) => Player
  ): { game: Game; newBadges: string[]; eloDelta: number } => {
    if (!activeLeagueId) throw new Error('No active league');

    const memberships = getLeagueMemberships();
    const getUserMembership = (playerId: string) =>
      memberships.find(m => m.leagueId === activeLeagueId && m.playerId === playerId);

    const opponent = getOrCreatePlayer(input.opponentName);
    const userMembership = getUserMembership(userId);
    const oppMembership = getUserMembership(opponent.id);

    if (!userMembership || !oppMembership) throw new Error('Missing membership');

    const won = input.playerScore > input.opponentScore;
    const now = new Date().toISOString();
    const gameId = crypto.randomUUID();

    let eloChanges: Record<string, number>;
    let playerIds: string[];
    let opponentIds: string[];

    if (input.type === 'doubles' && input.partnerName && input.opponent2Name) {
      const partner = getOrCreatePlayer(input.partnerName);
      const opponent2 = getOrCreatePlayer(input.opponent2Name);
      const partnerM = getUserMembership(partner.id);
      const opp2M = getUserMembership(opponent2.id);
      if (!partnerM || !opp2M) throw new Error('Missing membership');

      const { team1Deltas, team2Deltas } = calculateDoublesEloChanges(
        [{ elo: userMembership.elo, gamesPlayed: userMembership.gamesPlayed }, { elo: partnerM.elo, gamesPlayed: partnerM.gamesPlayed }],
        [{ elo: oppMembership.elo, gamesPlayed: oppMembership.gamesPlayed }, { elo: opp2M.elo, gamesPlayed: opp2M.gamesPlayed }],
        won
      );

      eloChanges = {
        [userId]: team1Deltas[0],
        [partner.id]: team1Deltas[1],
        [opponent.id]: team2Deltas[0],
        [opponent2.id]: team2Deltas[1],
      };
      playerIds = [userId, partner.id];
      opponentIds = [opponent.id, opponent2.id];
    } else {
      const userDelta = calculateEloChange(userMembership.elo, oppMembership.elo, won, userMembership.gamesPlayed);
      const oppDelta = calculateEloChange(oppMembership.elo, userMembership.elo, !won, oppMembership.gamesPlayed);
      eloChanges = { [userId]: userDelta, [opponent.id]: oppDelta };
      playerIds = [userId];
      opponentIds = [opponent.id];
    }

    const game: Game = {
      id: gameId,
      date: now,
      type: input.type,
      leagueId: activeLeagueId,
      playerIds,
      opponentIds,
      playerScore: input.playerScore,
      opponentScore: input.opponentScore,
      winner: won ? 'player' : 'opponent',
      eloChanges,
      venue: input.venue,
      createdAt: now,
    };

    // Save game
    const updatedGames = [...getGames(), game];
    saveGames(updatedGames);
    setAllGames(updatedGames);

    // Update all involved memberships
    const leagueGames = updatedGames.filter(g => g.leagueId === activeLeagueId);

    for (const [pid, delta] of Object.entries(eloChanges)) {
      const mIdx = memberships.findIndex(m => m.leagueId === activeLeagueId && m.playerId === pid);
      if (mIdx < 0) continue;
      const m = memberships[mIdx];

      const isOnWinningSide = playerIds.includes(pid) ? won : !won;
      const avgOppElo = playerIds.includes(pid)
        ? opponentIds.reduce((sum, oid) => {
            const om = memberships.find(x => x.leagueId === activeLeagueId && x.playerId === oid);
            return sum + (om?.elo || 1000);
          }, 0) / opponentIds.length
        : playerIds.reduce((sum, pid2) => {
            const pm = memberships.find(x => x.leagueId === activeLeagueId && x.playerId === pid2);
            return sum + (pm?.elo || 1000);
          }, 0) / playerIds.length;

      const newStreak = isOnWinningSide
        ? (m.currentStreak > 0 ? m.currentStreak + 1 : 1)
        : (m.currentStreak < 0 ? m.currentStreak - 1 : -1);

      const xp = calculateXpEarned(isOnWinningSide, newStreak, m.elo, avgOppElo);

      memberships[mIdx] = {
        ...m,
        elo: Math.max(0, m.elo + delta),
        eloHistory: [...m.eloHistory, { date: now, elo: Math.max(0, m.elo + delta), gameId }],
        wins: m.wins + (isOnWinningSide ? 1 : 0),
        losses: m.losses + (isOnWinningSide ? 0 : 1),
        currentStreak: newStreak,
        bestStreak: Math.max(m.bestStreak, newStreak),
        gamesPlayed: m.gamesPlayed + 1,
        xp: m.xp + xp,
        level: getLevel(m.xp + xp),
        recentForm: [...m.recentForm, isOnWinningSide ? 'W' : 'L'].slice(-5) as ('W' | 'L')[],
      };
    }

    // Check badges for user
    const userM = memberships.find(m => m.leagueId === activeLeagueId && m.playerId === userId)!;
    // Build a temp Player for badge checking
    const tempPlayer: Player = {
      id: userId, name: '', elo: userM.elo, eloHistory: userM.eloHistory,
      wins: userM.wins, losses: userM.losses, currentStreak: userM.currentStreak,
      bestStreak: userM.bestStreak, gamesPlayed: userM.gamesPlayed,
      badges: userM.badges, xp: userM.xp, level: userM.level,
      recentForm: userM.recentForm, createdAt: '', isUser: true,
    };
    const newBadges = checkBadges(tempPlayer, leagueGames);
    if (newBadges.length > 0) {
      const uIdx = memberships.findIndex(m => m.leagueId === activeLeagueId && m.playerId === userId);
      memberships[uIdx].badges = [...memberships[uIdx].badges, ...newBadges];
    }

    saveLeagueMemberships(memberships);

    return { game, newBadges, eloDelta: eloChanges[userId] };
  }, [activeLeagueId]);

  const getUserGames = useCallback((userId: string) => {
    return games
      .filter(g => g.playerIds.includes(userId) || g.opponentIds.includes(userId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [games]);

  const refreshGames = useCallback(() => {
    setAllGames(getGames());
  }, []);

  return {
    games,
    loading,
    logGame,
    getUserGames,
    refreshGames,
  };
}
