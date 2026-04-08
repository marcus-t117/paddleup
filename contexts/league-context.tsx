'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { League, LeagueMembership } from '@/types';
import {
  initialize,
  getLeagues,
  saveLeagues,
  getLeagueMemberships,
  saveLeagueMemberships,
  getActiveLeagueId,
  setActiveLeagueId as persistActiveLeague,
} from '@/lib/storage';
import { STARTING_ELO } from '@/lib/constants';

interface LeagueContextValue {
  leagues: League[];
  activeLeagueId: string | null;
  activeLeague: League | null;
  setActiveLeagueId: (id: string) => void;
  createLeague: (name: string, memberIds: string[]) => League;
  addMembersToLeague: (leagueId: string, playerIds: string[]) => void;
  loading: boolean;
}

const LeagueContext = createContext<LeagueContextValue | null>(null);

export function LeagueProvider({ children }: { children: ReactNode }) {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [activeLeagueId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = initialize();
    setLeagues(data.leagues);
    const storedActive = getActiveLeagueId();
    setActiveId(storedActive || data.leagues[0]?.id || null);
    setLoading(false);
  }, []);

  const activeLeague = leagues.find(l => l.id === activeLeagueId) || null;

  const setActiveLeagueId = useCallback((id: string) => {
    setActiveId(id);
    persistActiveLeague(id);
  }, []);

  const createLeague = useCallback((name: string, memberIds: string[]): League => {
    const league: League = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      isDefault: false,
      memberIds,
    };

    // Save league
    const updated = [...getLeagues(), league];
    saveLeagues(updated);
    setLeagues(updated);

    // Create fresh memberships for each member
    const existingMemberships = getLeagueMemberships();
    const newMemberships: LeagueMembership[] = memberIds.map(playerId => ({
      leagueId: league.id,
      playerId,
      elo: STARTING_ELO,
      eloHistory: [{ date: new Date().toISOString(), elo: STARTING_ELO, gameId: 'initial' }],
      wins: 0,
      losses: 0,
      currentStreak: 0,
      bestStreak: 0,
      gamesPlayed: 0,
      xp: 0,
      level: 1,
      recentForm: [],
      badges: [],
    }));

    saveLeagueMemberships([...existingMemberships, ...newMemberships]);

    // Set as active
    setActiveLeagueId(league.id);

    return league;
  }, [setActiveLeagueId]);

  const addMembersToLeague = useCallback((leagueId: string, playerIds: string[]) => {
    const allLeagues = getLeagues();
    const league = allLeagues.find(l => l.id === leagueId);
    if (!league) return;

    const newIds = playerIds.filter(id => !league.memberIds.includes(id));
    if (newIds.length === 0) return;

    league.memberIds = [...league.memberIds, ...newIds];
    saveLeagues(allLeagues);
    setLeagues([...allLeagues]);

    // Create memberships for new members
    const existingMemberships = getLeagueMemberships();
    const newMemberships: LeagueMembership[] = newIds.map(playerId => ({
      leagueId,
      playerId,
      elo: STARTING_ELO,
      eloHistory: [{ date: new Date().toISOString(), elo: STARTING_ELO, gameId: 'initial' }],
      wins: 0,
      losses: 0,
      currentStreak: 0,
      bestStreak: 0,
      gamesPlayed: 0,
      xp: 0,
      level: 1,
      recentForm: [],
      badges: [],
    }));
    saveLeagueMemberships([...existingMemberships, ...newMemberships]);
  }, []);

  return (
    <LeagueContext.Provider value={{
      leagues,
      activeLeagueId,
      activeLeague,
      setActiveLeagueId,
      createLeague,
      addMembersToLeague,
      loading,
    }}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague() {
  const ctx = useContext(LeagueContext);
  if (!ctx) throw new Error('useLeague must be used within LeagueProvider');
  return ctx;
}
