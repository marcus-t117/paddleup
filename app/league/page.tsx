'use client';

import { useState } from 'react';
import { usePlayers } from '@/hooks/use-players';
import { useLeague } from '@/contexts/league-context';
import Podium from '@/components/podium';
import LeaderboardRow from '@/components/leaderboard-row';
import LeagueSwitcher from '@/components/league-switcher';
import AddPlayerModal from '@/components/add-player-modal';

export default function LeaguePage() {
  const { players, userId, loading, getOrCreatePlayer, refreshPlayers } = usePlayers();
  const { activeLeague, activeLeagueId, removePlayerFromLeague, loading: leagueLoading } = useLeague();
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  if (loading || leagueLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const sorted = [...players].sort((a, b) => b.elo - a.elo);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const userRank = sorted.findIndex(p => p.id === userId) + 1;
  const userInTop3 = userRank <= 3;

  const handleAddPlayer = (name: string) => {
    getOrCreatePlayer(name);
    refreshPlayers();
    setShowAddPlayer(false);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* League Switcher */}
      <section>
        <LeagueSwitcher />
      </section>

      {/* Header */}
      <section className="flex items-end justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="font-[family-name:var(--font-headline)] font-bold text-primary uppercase tracking-widest text-xs">
            {activeLeague?.name || 'League'}
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-[family-name:var(--font-headline)]">
            LEAGUE RANKINGS
          </h1>
        </div>
        <button
          onClick={() => setShowAddPlayer(true)}
          className="flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity active:scale-[0.98] flex-shrink-0"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          Add
        </button>
      </section>

      {/* Podium */}
      {top3.length > 0 ? (
        <section className="bg-surface-container-low rounded-[2rem] p-4">
          <Podium
            players={top3}
            userId={userId}
            onRemove={activeLeagueId ? (playerId) => {
              removePlayerFromLeague(activeLeagueId, playerId);
              refreshPlayers();
            } : undefined}
          />
        </section>
      ) : (
        <section className="bg-surface-container-low p-8 rounded-[2rem] text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">groups</span>
          <p className="text-on-surface-variant font-medium">No members yet. Add players to get started.</p>
        </section>
      )}

      {/* User highlight (if not in top 3) */}
      {!userInTop3 && userId && (
        <section>
          {sorted.map((p, i) => {
            if (p.id !== userId) return null;
            return <LeaderboardRow key={p.id} player={p} rank={i + 1} isUser={true} />;
          })}
        </section>
      )}

      {/* Rest of leaderboard */}
      <section className="space-y-3">
        {rest.map((player, i) => (
          <LeaderboardRow
            key={player.id}
            player={player}
            rank={i + 4}
            isUser={player.id === userId}
            onRemove={player.id !== userId && activeLeagueId ? () => {
              removePlayerFromLeague(activeLeagueId, player.id);
              refreshPlayers();
            } : undefined}
          />
        ))}
      </section>

      <AddPlayerModal
        isOpen={showAddPlayer}
        onClose={() => setShowAddPlayer(false)}
        onAdd={handleAddPlayer}
      />
    </div>
  );
}
