'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Game, Player } from '@/types';
import { getGames, saveGames, getPlayers, savePlayers } from '@/lib/storage';
import { calculateEloChange, calculateDoublesEloChanges } from '@/lib/elo';
import { calculateXpEarned } from '@/lib/xp';
import { getLevel } from '@/lib/utils';
import { checkBadges } from '@/lib/badges';

interface LogGameInput {
  type: 'singles' | 'doubles';
  opponentName: string;
  opponent2Name?: string;
  partnerName?: string;
  playerScore: number;
  opponentScore: number;
  venue?: string;
}

function updatePlayerStats(player: Player, won: boolean, eloDelta: number, xpEarned: number, gameDate: string, gameId: string): Player {
  const newStreak = won
    ? (player.currentStreak > 0 ? player.currentStreak + 1 : 1)
    : (player.currentStreak < 0 ? player.currentStreak - 1 : -1);

  return {
    ...player,
    elo: Math.max(0, player.elo + eloDelta),
    eloHistory: [...player.eloHistory, { date: gameDate, elo: Math.max(0, player.elo + eloDelta), gameId }],
    wins: player.wins + (won ? 1 : 0),
    losses: player.losses + (won ? 0 : 1),
    currentStreak: newStreak,
    bestStreak: Math.max(player.bestStreak, newStreak),
    gamesPlayed: player.gamesPlayed + 1,
    xp: player.xp + xpEarned,
    level: getLevel(player.xp + xpEarned),
    recentForm: [...player.recentForm, won ? 'W' : 'L'].slice(-5) as ('W' | 'L')[],
  };
}

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setGames(getGames());
    setLoading(false);
  }, []);

  const logGame = useCallback((
    input: LogGameInput,
    userId: string,
    getOrCreatePlayer: (name: string) => Player
  ): { game: Game; newBadges: string[]; eloDelta: number } => {
    const players = getPlayers();
    const user = players.find(p => p.id === userId)!;
    const opponent = getOrCreatePlayer(input.opponentName);

    const won = input.playerScore > input.opponentScore;
    const now = new Date().toISOString();
    const gameId = crypto.randomUUID();

    let eloChanges: Record<string, number>;
    let playerIds: string[];
    let opponentIds: string[];

    if (input.type === 'doubles' && input.partnerName && input.opponent2Name) {
      // Doubles
      const partner = getOrCreatePlayer(input.partnerName);
      const opponent2 = getOrCreatePlayer(input.opponent2Name);

      const { team1Deltas, team2Deltas } = calculateDoublesEloChanges(
        [{ elo: user.elo, gamesPlayed: user.gamesPlayed }, { elo: partner.elo, gamesPlayed: partner.gamesPlayed }],
        [{ elo: opponent.elo, gamesPlayed: opponent.gamesPlayed }, { elo: opponent2.elo, gamesPlayed: opponent2.gamesPlayed }],
        won
      );

      eloChanges = {
        [user.id]: team1Deltas[0],
        [partner.id]: team1Deltas[1],
        [opponent.id]: team2Deltas[0],
        [opponent2.id]: team2Deltas[1],
      };
      playerIds = [user.id, partner.id];
      opponentIds = [opponent.id, opponent2.id];
    } else {
      // Singles
      const userDelta = calculateEloChange(user.elo, opponent.elo, won, user.gamesPlayed);
      const oppDelta = calculateEloChange(opponent.elo, user.elo, !won, opponent.gamesPlayed);

      eloChanges = {
        [user.id]: userDelta,
        [opponent.id]: oppDelta,
      };
      playerIds = [user.id];
      opponentIds = [opponent.id];
    }

    const game: Game = {
      id: gameId,
      date: now,
      type: input.type,
      playerIds,
      opponentIds,
      playerScore: input.playerScore,
      opponentScore: input.opponentScore,
      winner: won ? 'player' : 'opponent',
      eloChanges,
      venue: input.venue,
      createdAt: now,
    };

    // Update all involved players
    const allGames = [...getGames(), game];
    const updatedPlayers = getPlayers();
    const playerUpdates = new Map<string, Player>();

    for (const [pid, delta] of Object.entries(eloChanges)) {
      const p = updatedPlayers.find(pl => pl.id === pid);
      if (!p) continue;

      const isOnWinningSide = playerIds.includes(pid) ? won : !won;
      const avgOppElo = playerIds.includes(pid)
        ? opponentIds.reduce((sum, oid) => sum + (updatedPlayers.find(pl => pl.id === oid)?.elo || 1000), 0) / opponentIds.length
        : playerIds.reduce((sum, pid2) => sum + (updatedPlayers.find(pl => pl.id === pid2)?.elo || 1000), 0) / playerIds.length;

      const newStreak = isOnWinningSide
        ? (p.currentStreak > 0 ? p.currentStreak + 1 : 1)
        : (p.currentStreak < 0 ? p.currentStreak - 1 : -1);

      const xp = calculateXpEarned(isOnWinningSide, newStreak, p.elo, avgOppElo);
      const updated = updatePlayerStats(p, isOnWinningSide, delta, xp, now, gameId);
      playerUpdates.set(pid, updated);
    }

    saveGames(allGames);
    setGames(allGames);

    // Check badges for user
    const updatedUser = playerUpdates.get(userId)!;
    const newBadges = checkBadges(updatedUser, allGames);
    updatedUser.badges = [...updatedUser.badges, ...newBadges];
    playerUpdates.set(userId, updatedUser);

    // Save all player updates
    const finalPlayers = updatedPlayers.map(p => playerUpdates.get(p.id) || p);
    savePlayers(finalPlayers);

    return { game, newBadges, eloDelta: eloChanges[userId] };
  }, []);

  const getUserGames = useCallback((userId: string) => {
    return games
      .filter(g => g.playerIds.includes(userId) || g.opponentIds.includes(userId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [games]);

  const refreshGames = useCallback(() => {
    setGames(getGames());
  }, []);

  return {
    games,
    loading,
    logGame,
    getUserGames,
    refreshGames,
  };
}
