'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Player, LeagueMembership } from '@/types';
import { getPlayers, savePlayers, initialize, getLeagueMemberships, saveLeagueMemberships, getLeagues, saveLeagues } from '@/lib/storage';
import { useLeague } from '@/contexts/league-context';
import { STARTING_ELO } from '@/lib/constants';

function overlayMembership(player: Player, membership: LeagueMembership | undefined): Player {
  if (!membership) return { ...player, elo: STARTING_ELO, eloHistory: [], wins: 0, losses: 0, currentStreak: 0, bestStreak: 0, gamesPlayed: 0, badges: [], xp: 0, level: 1, recentForm: [] };
  return {
    ...player,
    elo: membership.elo,
    eloHistory: membership.eloHistory,
    wins: membership.wins,
    losses: membership.losses,
    currentStreak: membership.currentStreak,
    bestStreak: membership.bestStreak,
    gamesPlayed: membership.gamesPlayed,
    badges: membership.badges,
    xp: membership.xp,
    level: membership.level,
    recentForm: membership.recentForm,
  };
}

export function usePlayers() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { activeLeagueId, syncVersion } = useLeague();

  useEffect(() => {
    const data = initialize();
    setAllPlayers(data.players);
    setUserId(data.userId);
    setLoading(false);
  }, [syncVersion]);

  // Resolve players with league-scoped stats
  // isUser is derived from userId at read time so synced players never inherit another device's isUser flag
  const players = (() => {
    if (!activeLeagueId) return allPlayers.map(p => ({ ...p, isUser: p.id === userId }));
    const memberships = getLeagueMemberships().filter(m => m.leagueId === activeLeagueId);
    const memberIds = new Set(memberships.map(m => m.playerId));

    return allPlayers
      .filter(p => memberIds.has(p.id))
      .map(p => {
        const m = memberships.find(m => m.playerId === p.id);
        return { ...overlayMembership(p, m), isUser: p.id === userId };
      });
  })();

  // All players regardless of league (for create-league member picker)
  const globalPlayers = allPlayers;

  const currentUser = players.find(p => p.id === userId) || null;

  const updatePlayer = useCallback((updated: Player) => {
    // Update the membership for the active league
    if (!activeLeagueId) return;
    const all = getLeagueMemberships();
    const idx = all.findIndex(m => m.leagueId === activeLeagueId && m.playerId === updated.id);
    if (idx >= 0) {
      all[idx] = {
        ...all[idx],
        elo: updated.elo,
        eloHistory: updated.eloHistory,
        wins: updated.wins,
        losses: updated.losses,
        currentStreak: updated.currentStreak,
        bestStreak: updated.bestStreak,
        gamesPlayed: updated.gamesPlayed,
        badges: updated.badges,
        xp: updated.xp,
        level: updated.level,
        recentForm: updated.recentForm,
      };
      saveLeagueMemberships(all);
    }
    // Also update identity fields on the global player
    setAllPlayers(prev => prev.map(p => p.id === updated.id ? { ...p, name: updated.name } : p));
  }, [activeLeagueId]);

  const addPlayer = useCallback((player: Player) => {
    const existing = getPlayers();
    if (!existing.find(p => p.id === player.id)) {
      const updated = [...existing, player];
      savePlayers(updated);
      setAllPlayers(updated);
    }
  }, []);

  const getOrCreatePlayer = useCallback((name: string): Player => {
    const existing = allPlayers.find(
      p => p.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      // Ensure they're a member of the active league
      if (activeLeagueId) {
        const leagues = getLeagues();
        const league = leagues.find(l => l.id === activeLeagueId);
        if (league && !league.memberIds.includes(existing.id)) {
          league.memberIds.push(existing.id);
          saveLeagues(leagues);
          // Create membership
          const memberships = getLeagueMemberships();
          memberships.push({
            leagueId: activeLeagueId,
            playerId: existing.id,
            elo: STARTING_ELO,
            eloHistory: [{ date: new Date().toISOString(), elo: STARTING_ELO, gameId: 'initial' }],
            wins: 0, losses: 0, currentStreak: 0, bestStreak: 0, gamesPlayed: 0,
            xp: 0, level: 1, recentForm: [], badges: [],
          });
          saveLeagueMemberships(memberships);
        }
      }
      return existing;
    }

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      elo: STARTING_ELO,
      eloHistory: [{ date: new Date().toISOString(), elo: STARTING_ELO, gameId: 'initial' }],
      wins: 0, losses: 0, currentStreak: 0, bestStreak: 0, gamesPlayed: 0,
      badges: [], xp: 0, level: 1, recentForm: [],
      createdAt: new Date().toISOString(),
      isUser: false,
    };

    // Save globally
    addPlayer(newPlayer);

    // Add to active league
    if (activeLeagueId) {
      const leagues = getLeagues();
      const league = leagues.find(l => l.id === activeLeagueId);
      if (league) {
        league.memberIds.push(newPlayer.id);
        saveLeagues(leagues);
      }
      const memberships = getLeagueMemberships();
      memberships.push({
        leagueId: activeLeagueId,
        playerId: newPlayer.id,
        elo: STARTING_ELO,
        eloHistory: [{ date: new Date().toISOString(), elo: STARTING_ELO, gameId: 'initial' }],
        wins: 0, losses: 0, currentStreak: 0, bestStreak: 0, gamesPlayed: 0,
        xp: 0, level: 1, recentForm: [], badges: [],
      });
      saveLeagueMemberships(memberships);
    }

    return newPlayer;
  }, [allPlayers, activeLeagueId, addPlayer]);

  const getPlayerById = useCallback((id: string) => {
    return players.find(p => p.id === id);
  }, [players]);

  const refreshPlayers = useCallback(() => {
    setAllPlayers(getPlayers());
  }, []);

  return {
    players,
    globalPlayers,
    currentUser,
    userId,
    loading,
    updatePlayer,
    addPlayer,
    getPlayerById,
    getOrCreatePlayer,
    refreshPlayers,
  };
}
