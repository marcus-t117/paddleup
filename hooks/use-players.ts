'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Player } from '@/types';
import { getPlayers, savePlayers, addPlayer as storageAddPlayer, initialize } from '@/lib/storage';

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { players: p, userId: uid } = initialize();
    setPlayers(p);
    setUserId(uid);
    setLoading(false);
  }, []);

  const currentUser = players.find(p => p.id === userId) || null;

  const updatePlayer = useCallback((updated: Player) => {
    setPlayers(prev => {
      const next = prev.map(p => p.id === updated.id ? updated : p);
      savePlayers(next);
      return next;
    });
  }, []);

  const addPlayer = useCallback((player: Player) => {
    setPlayers(prev => {
      const next = [...prev, player];
      savePlayers(next);
      return next;
    });
  }, []);

  const getPlayerById = useCallback((id: string) => {
    return players.find(p => p.id === id);
  }, [players]);

  const getOrCreatePlayer = useCallback((name: string): Player => {
    const existing = players.find(
      p => p.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) return existing;

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name,
      elo: 1000,
      eloHistory: [{ date: new Date().toISOString(), elo: 1000, gameId: 'initial' }],
      wins: 0,
      losses: 0,
      currentStreak: 0,
      bestStreak: 0,
      gamesPlayed: 0,
      badges: [],
      xp: 0,
      level: 1,
      recentForm: [],
      createdAt: new Date().toISOString(),
      isUser: false,
    };

    addPlayer(newPlayer);
    return newPlayer;
  }, [players, addPlayer]);

  const refreshPlayers = useCallback(() => {
    setPlayers(getPlayers());
  }, []);

  return {
    players,
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
