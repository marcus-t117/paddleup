'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Game, Player } from '@/types';
import { getGames, saveGames, getPlayers, savePlayers } from '@/lib/storage';
import { calculateEloChange } from '@/lib/elo';
import { calculateXpEarned } from '@/lib/xp';
import { getLevel } from '@/lib/utils';
import { checkBadges } from '@/lib/badges';

interface LogGameInput {
  type: 'singles' | 'doubles';
  opponentName: string;
  partnerName?: string;
  opponent2Name?: string;
  playerScore: number;
  opponentScore: number;
  venue?: string;
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

    // Refresh players list in case new player was created
    const updatedPlayers = getPlayers();

    const won = input.playerScore > input.opponentScore;

    // Calculate ELO changes
    const userEloDelta = calculateEloChange(user.elo, opponent.elo, won, user.gamesPlayed);
    const oppEloDelta = calculateEloChange(opponent.elo, user.elo, !won, opponent.gamesPlayed);

    const eloChanges: Record<string, number> = {
      [user.id]: userEloDelta,
      [opponent.id]: oppEloDelta,
    };

    // Create game record
    const game: Game = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: input.type,
      playerIds: [user.id],
      opponentIds: [opponent.id],
      playerScore: input.playerScore,
      opponentScore: input.opponentScore,
      winner: won ? 'player' : 'opponent',
      eloChanges,
      venue: input.venue,
      createdAt: new Date().toISOString(),
    };

    // Update user
    const newUserStreak = won
      ? (user.currentStreak > 0 ? user.currentStreak + 1 : 1)
      : (user.currentStreak < 0 ? user.currentStreak - 1 : -1);

    const xpEarned = calculateXpEarned(
      won,
      newUserStreak,
      user.elo,
      opponent.elo
    );

    const updatedUser: Player = {
      ...user,
      elo: Math.max(0, user.elo + userEloDelta),
      eloHistory: [...user.eloHistory, { date: game.date, elo: Math.max(0, user.elo + userEloDelta), gameId: game.id }],
      wins: user.wins + (won ? 1 : 0),
      losses: user.losses + (won ? 0 : 1),
      currentStreak: newUserStreak,
      bestStreak: Math.max(user.bestStreak, newUserStreak),
      gamesPlayed: user.gamesPlayed + 1,
      xp: user.xp + xpEarned,
      level: getLevel(user.xp + xpEarned),
      recentForm: [...user.recentForm, won ? 'W' : 'L'].slice(-5) as ('W' | 'L')[],
    };

    // Update opponent
    const newOppStreak = !won
      ? (opponent.currentStreak > 0 ? opponent.currentStreak + 1 : 1)
      : (opponent.currentStreak < 0 ? opponent.currentStreak - 1 : -1);

    const updatedOpponent: Player = {
      ...opponent,
      elo: Math.max(0, opponent.elo + oppEloDelta),
      eloHistory: [...opponent.eloHistory, { date: game.date, elo: Math.max(0, opponent.elo + oppEloDelta), gameId: game.id }],
      wins: opponent.wins + (!won ? 1 : 0),
      losses: opponent.losses + (!won ? 0 : 1),
      currentStreak: newOppStreak,
      bestStreak: Math.max(opponent.bestStreak, newOppStreak),
      gamesPlayed: opponent.gamesPlayed + 1,
      xp: opponent.xp + calculateXpEarned(!won, newOppStreak, opponent.elo, user.elo),
      level: getLevel(opponent.xp + calculateXpEarned(!won, newOppStreak, opponent.elo, user.elo)),
      recentForm: [...opponent.recentForm, !won ? 'W' : 'L'].slice(-5) as ('W' | 'L')[],
    };

    // Save game
    const allGames = [...getGames(), game];
    saveGames(allGames);
    setGames(allGames);

    // Check for new badges
    const newBadges = checkBadges(updatedUser, allGames);
    updatedUser.badges = [...updatedUser.badges, ...newBadges];

    // Save players
    const finalPlayers = updatedPlayers.map(p => {
      if (p.id === user.id) return updatedUser;
      if (p.id === opponent.id) return updatedOpponent;
      return p;
    });
    savePlayers(finalPlayers);

    return { game, newBadges, eloDelta: userEloDelta };
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
